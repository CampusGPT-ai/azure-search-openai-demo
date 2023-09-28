import os
import requests
import json
import openai
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential

# Set up OpenAI API
openai.api_key = "4efd5d72a7d9440cbbe6200784207ef0"
openai.api_base = "https://cog-b3yybe3qy5wiq.openai.azure.com/"
openai.api_type = 'azure'
openai.api_version = '2023-07-01-preview'

# Set up Azure Cognitive Search
search_service_name = "kwsearchtest"
index_name = "fsuindex"
admin_key = "HshGK5tUYkZY2UIkXDvWhPOGX6xUhAuEqWykoYP1OXAzSeCdxLG1"
credential = AzureKeyCredential(admin_key)
client = SearchClient(endpoint=f"https://{search_service_name}.search.windows.net/", index_name=index_name, credential=credential)
prompt="tell me about the cares program"
    # Chat roles
SYSTEM = "system"
USER = "user"
ASSISTANT = "assistant"
query_prompt_few_shots = [
    {'role' : USER, 'content' : 'What is academic advising?' },
    {'role' : ASSISTANT, 'content' : 'Academic advising is a service provided by institutions of higher education to support students in their academic journey.' },
    {'role' : USER, 'content' : 'What services are provided by an academic advisor?' },
    {'role' : ASSISTANT, 'content' : 'degree planning, help with financial aid, career advice' }
]
    
    
def search_index(query):
    search_results = client.search(search_text=query)
    return list(search_results)

def generate_response(prompt):
    response = openai.ChatCompletion.create(
        engine="rschat", 
        messages=query_prompt_few_shots,
        max_tokens=1024,
        n=1,
        stop=None,
        temperature=0.5,
    )
    return response.choices[0]

def handle_input(input_text):
    search_results = search_index(input_text)
    if len(search_results) > 0:
        return search_results[0]['content']
    else:
        prompt = f"Q: {input_text}\nA:"
        response = generate_response(prompt)
        return response


response = handle_input("cares program")
response2 = generate_response(response)
print(response)
print(response2)
