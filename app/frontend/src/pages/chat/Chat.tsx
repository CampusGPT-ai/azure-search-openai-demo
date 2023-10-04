import { useRef, useState, useEffect, useContext } from "react";
import { getLocalStorage, setLocalStorage } from "../../utilities/stateManagement";
import { v4 as uuid } from "uuid";
import { Stack, StackItem } from "@fluentui/react";
import UserContext from "../../contextVariables";
import ChatContainer from "../../components/ChatContainer/chatContainer";
import CitationDrawer from "../../components/Citation/citationDrawer";
import {
    AskResponse,
    chatApi,
    ConversationsResponse,
    conversationsApi,
    ConversationsModel,
    //InterestsResponse,
    InterestModel,
    TopicModel,
    ProfileModel,
    //interestsAllApi,
    currentProfileApi,
    topicsAllApi,
    TopicResponse
} from "../../api";

import { InterestList } from "../../components/Interests/InterestList";
import { TopicList } from "../../components/Topics/TopicList";
import { UserConversations } from "../../components/UserChatHistory/UserConversationsRedo";

import styles from "./Chat.module.css";

const Chat = () => {
    const { user } = useContext(UserContext);
    let interestsAsModel: InterestModel[] = [];

    if (user && user.interests) {
        interestsAsModel = user.interests.map(interest => ({
            interest,
            selected: false
        }));
    }

    const [isCitationPanelOpen, setIsCitationPanelOpen] = useState(false);

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const [activeCitation, setActiveCitation] = useState<string>();

    const [answers, setAnswers] = useState<[user: string, response: AskResponse][]>([]);

    const [conversations, setConversations] = useState<ConversationsResponse | undefined>(undefined);
    //const [interests, setInterests] = useState<InterestsResponse | undefined>(undefined);
    const [topics, setTopics] = useState<TopicResponse | undefined>(undefined);
    const [isNewConversation, setIsNewConversation] = useState<boolean>(getLocalStorage<boolean>("isNewConversation") || false);
    const [conversationId, setConversationId] = useState<string>(getLocalStorage<string>("conversationId") || uuid().toString());
    const [activeConversation, setActiveConversation] = useState<ConversationsModel | null>(null);
    const [currentUser, setCurrentUser] = useState<ProfileModel | null>(null);

    //const makeInterestApiRequest = async () => {
    //    setIsLoading(true);
    //    try {
    //        const result = await interestsAllApi();
    //        setInterests(result);
    //    } catch (e) {
    //        setError(e);
    //    } finally {
    //        setIsLoading(false);
    //    }
    //};

    const makeTopicApiRequest = async () => {
        setIsLoading(true);
        try {
            const result = await topicsAllApi();
            setTopics(result);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const makeConversationsApiRequest = async () => {
        setIsLoading(true);
        try {
            const result = await conversationsApi();
            setConversations(result);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const makeCurrentUserApiRequest = async () => {
        setIsLoading(true);
        try {
            const result = await currentProfileApi();
            console.log("Current user: " + result);
            setCurrentUser(result.profile);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const makeApiRequest = async (question: string) => {
        try {
            const result = await chatApi(question, answers, conversationId, isNewConversation);
            setAnswers([...answers, [question, result]]);
            setConversationId(result.conversation_id);

            if (isNewConversation) {
                console.log("Received response, including new conversation title, setting title: " + result.conversation_topic);
                const convo: ConversationsModel = {
                    id: conversationId,
                    topic: result.conversation_topic,
                    start_time: Date.now().toString(),
                    end_time: "",
                    interactions: []
                };
                conversations?.list.unshift(convo);
                setIsNewConversation(false);
            }
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("getting current user");
        makeCurrentUserApiRequest();
        chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading];
    }, []);

    useEffect(() => {
        console.log("Setting State Variables");
        setConversationId(uuid().toString());
        setConversations(undefined);
        //setInterests(undefined);
        setIsNewConversation(true);
        clearChat();
        makeConversationsApiRequest();
        makeTopicApiRequest();
        //makeInterestApiRequest();
    }, [currentUser]);

    const clearChat = () => {
        lastQuestionRef.current = "";
        error && setError(undefined);
        setActiveCitation(undefined);
        setAnswers([]);
    };

    const onShowCitation = (citation: string) => {
        if (activeCitation === citation) {
            setIsCitationPanelOpen(false);
        } else {
            setActiveCitation(citation);
            console.log("citation set to " + activeCitation);
            setIsCitationPanelOpen(true);
        }
    };

    const onConversationSelected = (conversationId: string) => {
        console.log("Conversation selected: id=" + conversationId);
        if (conversations != null) {
            const matchingConversation = conversations.list.find(el => el.id === conversationId);
            if (matchingConversation) {
                console.log("Found conversation with topic: " + matchingConversation.topic);
                setActiveConversation(matchingConversation);
                setConversationId(matchingConversation.id);
            }
        }
    };

    useEffect(() => {
        console.log("new active conversation detected:" + activeConversation?.id);
        clearChat();
        let lastQuestion = "";
        let answers: [user: string, answer: string][] = [];
        activeConversation?.interactions.forEach(i => {
            lastQuestion = i.user;
            answers.push([
                i.user,
                JSON.stringify({
                    conversationId: activeConversation.id,
                    answer: i.bot,
                    data_points: [],
                    follow_up: []
                })
            ]);
        });
        lastQuestionRef.current = lastQuestion;
        setAnswers(answers.reverse().map(x => [x[0], JSON.parse(x[1])]));
    }, [activeConversation]);

    const startNewChat = () => {
        console.log("Starting new chat");
        clearChat();
        setIsNewConversation(true);
        setConversationId(uuid().toString());
    };

    useEffect(() => {
        setLocalStorage<string>("conversationId", conversationId);
    }, [conversationId]);

    useEffect(() => {
        setLocalStorage("isNewChat", isNewConversation);
    }, [isNewConversation]);

    //let interestList: Array<InterestModel> = [];
    //if (interests?.list) {
    //    interestList = interests.list;
    //}

    let topicList: Array<TopicModel> = [];
    if (topics?.list) {
        topicList = topics.list;
    }

    let conversationsList: Array<ConversationsModel> = [];
    if (conversations?.list) {
        conversationsList = conversations.list;
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentHeader}>
                <h2>Your Interests</h2>
                <div className={styles.contentSection}>
                    <InterestList list={interestsAsModel} />
                </div>
            </div>
            <div className={styles.contentHeader}>
                <h2>Trending Topics</h2>
                <div className={styles.contentSection}>
                    <TopicList list={topicList} />
                </div>
            </div>
            <div className={styles.chatSection}>
                <Stack horizontal horizontalAlign="stretch">
                    <StackItem className={styles.chatHistoryContainer} disableShrink>
                        <UserConversations //chat history
                            conversations={conversationsList}
                            onConversationClicked={onConversationSelected}
                            onNewChatClicked={() => startNewChat()}
                        />
                    </StackItem>
                    <StackItem className={styles.chatInputContainer}>
                        <ChatContainer
                            answers={answers}
                            makeApiRequest={(question: string) => {
                                setIsLoading(true);
                                makeApiRequest(question);
                            }}
                            isLoading={isLoading}
                            error={error}
                            onShowCitation={c => {
                                onShowCitation(c);
                            }}
                        ></ChatContainer>
                        <CitationDrawer cite={activeCitation} isOpen={isCitationPanelOpen} onClose={() => setIsCitationPanelOpen(false)}></CitationDrawer>
                    </StackItem>
                </Stack>
            </div>
        </div>
    );
};

export default Chat;
