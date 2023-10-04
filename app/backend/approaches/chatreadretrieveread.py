from typing import Any

import openai
import time
import uuid
import json

from azure.search.documents.aio import SearchClient
from azure.search.documents.models import QueryType

from approaches.approach import ChatApproach
from approaches.profile_augmentations import ProfileAugmentations
from core.messagebuilder import MessageBuilder
from core.modelhelper import get_token_limit
from text import nonewlines
from profile.chathistory import ChatHistory
from profile.institution import Institution
from profile.profile import Profile
from profile.conversation import Conversation
from quart import jsonify
from quart import session




CONFIG_CURRENT_USER = "current_user"

class ChatReadRetrieveReadApproach(ChatApproach):

    EMBEDDING = "contentVector"

    # Chat roles
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"

    """
    Simple retrieve-then-read implementation, using the Cognitive Search and OpenAI APIs directly. It first retrieves
    top documents from search, then constructs a prompt with them, and then uses OpenAI to generate an completion
    (answer) with that prompt.
    """


    system_message_chat_conversation = """Assistant helps students with general questions, and questions about academic advising. Be brief in your answers.
Answer ONLY with the facts listed in the list of sources below. If there isn't enough information below, say you don't know. Do not generate answers that don't use the sources below. 
If asking a clarifying question to the user would help, ask the question.
For tabular information return it as an html table. Do not return markdown format. 
Each source has a name followed by colon and the actual information, always include the source name for each fact you use in the response. Use square brackets to reference the source, e.g. [info1.txt]. Don't combine sources, list each source separately, e.g. [info1.txt][info2.pdf].
Include the main topic of the current chat session in the respons.  

If the question is about classes or courses include the courses/classes the user has already taken in the response.

Return results in JSON format with the answer and topic as separate elements, following this example 
{ "topic": "conversation topic", "answer": "response to user question" }.
"""

    follow_up_questions_prompt_content = """Generate three very brief follow-up questions that the user would likely ask next. 
Try not to repeat questions that have already been asked.
Only generate questions and do not generate any text before or after the questions, such as 'Next Questions'.
Return results in JSON format with questions in an array, following this example 
[ "next question the user should ask" , "another question to ask" ] . """

    query_prompt_template = """Below is a history of the conversation so far, 
and a new question asked by the user that needs to be answered by searching in a knowledge base about
student centered information and advising details from the campus website and supplamental documentation.
Generate a search query based on the conversation and the new question.
Do not include cited source filenames and document names e.g info.txt or doc.pdf in the search query terms.
Do not include any text inside [] or <<>> in the search query terms.
Do not include any special characters like '+'.
If the question is not in English, translate the question to English before generating the search query.
If it is important to answer the new query, include the user Major and Year.
Include the user classes taken so far if the new question involves classes or courses.
If you cannot generate a search query, return just the number 0.
"""

    follow_up_prompt_template = """Below is a history of the last 5 interactions in the conversation so far.
Generate a list of the most likely follow up questions of interest based on the most recent history.
Use double angle brackets to reference the questions, e.g. <<Are there exclusions for prescriptions?>>.
Try not to repeat questions that have already been asked.
Only generate questions and do not generate any text before or after the questions, such as 'Next Questions'
"""

    query_prompt_few_shots = [
        {'role' : USER, 'content' : 'What is academic advising?' },
        {'role' : ASSISTANT, 'content' : 'Academic advising is a service provided by institutions of higher education to support students in their academic journey.' },
        {'role' : USER, 'content' : 'What services are provided by an academic advisor?' },
        {'role' : ASSISTANT, 'content' : 'degree planning, help with financial aid, career advice' }
    ]

    def __init__(self, search_client: SearchClient, current_institution: Institution, 
                current_session_id: str, chatgpt_deployment: str, chatgpt_model: 
                str, embedding_deployment: str, sourcepage_field: str, content_field: str):
        self.search_client = search_client
        self.chatgpt_deployment = chatgpt_deployment
        self.chatgpt_model = chatgpt_model
        self.embedding_deployment = embedding_deployment
        self.sourcepage_field = sourcepage_field
        self.content_field = content_field
        self.chatgpt_token_limit = get_token_limit(chatgpt_model)
        self.current_institution = current_institution
        self.current_session = current_session_id
        
    async def run(self, history: list[dict[str, str]], overrides: dict[str, Any]) -> Any:
        has_text = overrides.get("retrieval_mode") in ["text", "hybrid", None]  
        has_vector = overrides.get("retrieval_mode") in ["vectors", "hybrid", None]
        use_semantic_captions = True if overrides.get("semantic_captions") and has_text else False
        top = overrides.get("top") or 3
        exclude_category = overrides.get("exclude_category") or None
        filter = "category ne '{}'".format(exclude_category.replace("'", "''")) if exclude_category else None

        user_query = history[-1]["user"]
        user_q = 'Generate search query for: ' + user_query


        #load profile from session
        current_profile = Profile.load_by_id(session[CONFIG_CURRENT_USER])
        profile_augment = ProfileAugmentations(current_profile)

        # manage creation or loading of conversation
        conversation_id = overrides.get("conversation_id")
        if conversation_id is None or conversation_id == '':
            conversation_id = str(uuid.uuid4())

        isNewConversation = overrides.get("is_new_conversation")
        
        currentConversation = Conversation.create_if_not_exists(
            id=conversation_id, 
            session_id=self.current_session,
            user_id=session[CONFIG_CURRENT_USER]
        )

        # load history from persisted store based on the conversation
        history = ChatHistory.load_by_conversation(currentConversation.id)

        # QUERY STEP 1: Generate an optimized keyword search query based on the chat history and the last question
        messages = self.get_messages_from_history(
            self.query_prompt_template,
            self.chatgpt_model,
            history,
            user_q,
            self.query_prompt_few_shots + profile_augment.generate_profile_few_shot(),
            self.chatgpt_token_limit - len(user_q)
            )
        #print()
        #print("Query1")
        #for message in messages:
        #    print(message)
        chat_completion = await openai.ChatCompletion.acreate(
            deployment_id=self.chatgpt_deployment,
            model=self.chatgpt_model,
            messages=messages,
            temperature=0.0,
            max_tokens=32,
            n=1)

        query_text = chat_completion.choices[0].message.content
        #print(query_text)
        if query_text.strip() == "0":
            query_text = user_query # Use the last user input if we failed to generate a better query

        #print(query_text)


        # QUERY STEP 2: Retrieve relevant documents from the search index with the GPT optimized query

        # TODO: in order to filter search results, modify the filter based on query results
        
        # If retrieval mode includes vectors, compute an embedding for the query
        if has_vector:
            query_vector = (await openai.Embedding.acreate(engine=self.embedding_deployment, input=query_text))["data"][0]["embedding"]
        else:
            query_vector = None

         # Only keep the text query if the retrieval mode uses text, otherwise drop it
        if not has_text:
            query_text = None

        
        filter = profile_augment.generate_search_filter()
        
        # Use semantic L2 reranker if requested and if retrieval mode is text or hybrid (vectors + text)
        if overrides.get("semantic_ranker") and has_text:
            r = await self.search_client.search(query_text,
                                          filter=filter,
                                          query_type=QueryType.SEMANTIC,
                                          query_language="en-us",
                                          query_speller="lexicon",
                                          semantic_configuration_name="default",
                                          top=top,
                                          query_caption="extractive|highlight-false" if use_semantic_captions else None,
                                          vector=query_vector,
                                          top_k=50 if query_vector else None,
                                          vector_fields=self.EMBEDDING if query_vector else None)
        else:
            r = await self.search_client.search(query_text,
                                          filter=filter,
                                          top=top,
                                          vector=query_vector,
                                          top_k=50 if query_vector else None,
                                          vector_fields=self.EMBEDDING if query_vector else None)
        if use_semantic_captions:
            results = [doc[self.sourcepage_field] + ": " + nonewlines(" . ".join([c.text for c in doc['@search.captions']])) async for doc in r]
        else:
            results = [doc[self.sourcepage_field] + ": " + nonewlines(doc[self.content_field]) async for doc in r]
        content = "\n".join(results)

        # The below is unused for now, can be revisited later

        # TODO: revisit whether follow-up should be handled in the same call or separate
        # follow_up_questions_prompt = self.follow_up_questions_prompt_content if overrides.get("suggest_followup_questions") else ""
        follow_up_questions_prompt = ""  # blank out so we do not embed follup ups in answer, we will make a separate call for that

        # Allow client to replace the entire prompt, or to inject into the exiting prompt using >>> - (we are not using prompt injection for now)
    #    prompt_override = overrides.get("prompt_override")
    #    if prompt_override is None:
    #        system_message = self.system_message_chat_conversation.format(injected_prompt="", follow_up_questions_prompt=follow_up_questions_prompt)
    #    elif prompt_override.startswith(">>>"):
    #        system_message = self.system_message_chat_conversation.format(injected_prompt=prompt_override[3:] + "\n", follow_up_questions_prompt=follow_up_questions_prompt)
    #    else:
    #        system_message = prompt_override.format(follow_up_questions_prompt=follow_up_questions_prompt)


         # QUERY STEP 3: Generate a contextual and content specific answer using the search results and chat history

        chat_conversation = self.system_message_chat_conversation
        messages = self.get_messages_from_history(
            self.system_message_chat_conversation,
            self.chatgpt_model,
            [],
            user_query + "\n\nSources:\n" + content, # Model does not handle lengthy system messages well. Moving sources to latest user conversation to solve follow up questions prompt.
            max_tokens=self.chatgpt_token_limit,
            few_shots=profile_augment.generate_profile_few_shot()
        )

        #print()
        #print("Query3")
        #for message in messages:
        #    print()
        #    print(message)
        chat_completion = await openai.ChatCompletion.acreate(
            deployment_id=self.chatgpt_deployment,
            model=self.chatgpt_model,
            messages=messages,
            temperature=0,
            max_tokens=1024,
            n=1)


        #print()
        #print("Chat Completion")
        #print(chat_completion.choices[0].message.content)

        #chat_json_encoded = encode_for_json(chat_completion.choices[0].message.content)
        chat_json_encoded = chat_completion.choices[0].message.content.replace("\n", "\\n")
        chat_content_json = json.loads(chat_json_encoded)

        # persist the current conversation and update end time
        currentConversation.end_time = time.time()

        # if this is a new conversation, capture the topic
        if isNewConversation:
            currentConversation.topic = chat_content_json.get("topic")
        currentConversation.save()

        # persist response in chat history
        ChatHistory.create_interaction(
            conversation_id=currentConversation.id, 
            user_id=session[CONFIG_CURRENT_USER], 
            user_content=user_query, 
            bot_content=chat_content_json.get("answer")
        )

        # STEP 4: Generate a list of follow up questions
        messages = self.get_messages_from_history(
            self.follow_up_prompt_template,
            self.chatgpt_model,
            history,
            self.follow_up_questions_prompt_content,
            [],
            self.chatgpt_token_limit - len(user_q), 
            5
            )
        #print()
        #print("Query4")
        #for message in messages:
        #    print(message)
        chat_completion = await openai.ChatCompletion.acreate(
            deployment_id=self.chatgpt_deployment,
            model=self.chatgpt_model,
            messages=messages,
            temperature=0.0,
            max_tokens=1024,
            n=1)

        follow_up_content = chat_completion.choices[0].message.content
        follow_up_dict = dict()
        try:
            follow_up_dict = json.loads(follow_up_content)
        except:
            # without sufficient history openai will not return follow up, but a message saying it needs more history
            # ignore when parsing fails
            follow_up_dict = dict()

        msg_to_display = '\n\n'.join([str(message) for message in messages])

        rv = {
            "conversation_id": currentConversation.id,
            "conversation_topic": currentConversation.topic,
            "data_points": results, 
            "answer": chat_content_json.get("answer"), 
            "follow_up": follow_up_dict, 
            "thoughts": f"Searched for:<br>{query_text}<br><br>Conversations:<br>" + msg_to_display.replace('\n', '<br>')
        }
        json_rv = jsonify(rv)
        return rv

    def get_messages_from_history(self, system_prompt: str, model_id: str, history: list[dict[str, str]], 
                                  user_conv: str, few_shots = [], max_tokens: int = 4096, max_user_messages: int = 100) -> list:
        
        message_builder = MessageBuilder(system_prompt, model_id)

        # Add examples to show the chat what responses we want. It will try to mimic any responses and make sure they match the rules laid out in the system message.
        for shot in few_shots:
            message_builder.append_message(shot.get('role'), shot.get('content'))

        user_content = user_conv
        append_index = len(few_shots) + 1

        message_builder.append_message(self.USER, user_content, index=append_index)

        user_message_count = 0
        for h in history:
            if bot_msg := h.get("bot"):
                message_builder.append_message(self.ASSISTANT, bot_msg, index=append_index)
            if user_msg := h.get("user"):
                message_builder.append_message(self.USER, user_msg, index=append_index)
                user_message_count = user_message_count + 1
            if message_builder.token_length > max_tokens:
                break
            if user_message_count > max_user_messages:
                break

        messages = message_builder.messages
        return messages
    

@staticmethod
def encode_for_json(input_str):
    # Use json.dumps to safely encode the string
    json_encoded = json.dumps(input_str)
    # Strip the outer double quotes
    return json_encoded[1:-1]
