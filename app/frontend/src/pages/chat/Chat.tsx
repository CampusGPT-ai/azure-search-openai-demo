import { useRef, useState, useEffect, useContext, forwardRef } from "react";
import { getLocalStorage, setLocalStorage } from "../../utilities/stateManagement";
import { v4 as uuid } from "uuid";
import { Stack, StackItem } from "@fluentui/react";
import { UserContext, TopicContext, updateSelectedInterestFunc } from "../../contextVariables";
import ChatContainer from "../../components/ChatContainer/chatContainer";
import { getDistinctTopics, filterTopicsByInterests, getQuestionsByTopic } from "../../components/Topics/TopicUtilities";
import CitationDrawer from "../../components/Citation/citationDrawer";
import {
    AskResponse,
    chatApi,
    ConversationsResponse,
    conversationsApi,
    ConversationsModel,
    InterestModel,
    TopicModel,
    createDefaultAskResponse
} from "../../api";

import { InterestList } from "../../components/Interests/InterestList";
import { TopicList } from "../../components/Topics/TopicList";
import { UserConversations } from "../../components/UserChatHistory/UserConversationsRedo";
import { CaretDown24Filled } from "@fluentui/react-icons";
import { ProfilePopover } from "../../components/ProfilePopover/ProfilePopover";
import { Popover, PopoverSurface } from "@fluentui/react-components";
import { ProfileModel, createDefaultProfile } from "../../api";
import type { PositioningImperativeRef, PopoverTriggerChildProps, PopoverProps } from "@fluentui/react-components";
import { useProfilePopAnchor, useShowProfile } from "../layout/Layout";

import styles from "./Chat.module.css";

const Chat = () => {
    const { user, setUser, selectedProfile, setSelectedProfile } = useContext(UserContext);
    const { topics } = useContext(TopicContext);
    const prevTopicsRef = useRef<TopicModel[]>([]);
    const prevCheckedInterestsRef = useRef<InterestModel[]>([]);
    const [topicsList, setTopics] = useState<string[]>([]);
    const [interestList, setInterests] = useState<InterestModel[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string>("");
    const [questionsList, setQuestions] = useState<string[]>([]);
    const [checkedInterests, setCheckedInterests] = useState<InterestModel[]>([]);
    const [isCitationPanelOpen, setIsCitationPanelOpen] = useState(false);
    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();
    const [activeCitation, setActiveCitation] = useState<string>();
    const [chatHistory, setChatHistory] = useState<[user: string, response: AskResponse][]>([]);
    const [conversations, setConversations] = useState<ConversationsResponse | undefined>(undefined);
    const [isNewConversation, setIsNewConversation] = useState<boolean>(getLocalStorage<boolean>("isNewConversation") || false);
    const [conversationId, setConversationId] = useState<string>(getLocalStorage<string>("conversationId") || uuid().toString());
    const [activeConversation, setActiveConversation] = useState<ConversationsModel | null>(null);
    const [profilePopOpen, setProfilePopOpen] = useState(false);

    let conversationsList: Array<ConversationsModel> = [];
    if (conversations?.list) {
        conversationsList = conversations.list;
    }

    const updateTopics = async () => {
        try {
            console.log("updating topics list for topics len " + topics.length.toString());
            const initialTopicsList = await getDistinctTopics(topics);
            let filteredTopicsList = null;
            if (checkedInterests.length > 0 && selectedProfile != "none") {
                console.log("Initial checkedInterests:", JSON.stringify(checkedInterests, null, 2)); // Log initial checkedInterests

                // Check if all values for checkedInterests.selected are false
                const allFalse = checkedInterests.every(x => !x.selected);
                //console.log("All selected values false:", allFalse); // Log result of allFalse check

                // If all values are false, send the whole list to the filter
                // Otherwise, send only the interests with selected set to true
                const interestsToSend = allFalse ? checkedInterests.map(x => x.interest) : checkedInterests.filter(x => x.selected).map(x => x.interest);

                console.log("Interests to send:", JSON.stringify(interestsToSend, null, 2)); // Log interestsToSend

                filteredTopicsList = await filterTopicsByInterests(topics, interestsToSend);
                console.log("Returned list of filtered topics:", JSON.stringify(filteredTopicsList, null, 2)); // Log filteredTopicsList
            }

            if (filteredTopicsList != null && filteredTopicsList.length > 0) {
                console.log("setting topics to filtered topics: " + filteredTopicsList);
                setTopics(filteredTopicsList);
            } else {
                console.log("setting topics to initial topics: " + initialTopicsList);
                setTopics(initialTopicsList);
            }
        } catch (error) {
            console.error("Error updating topics:", error);
        }
    };

    const updateQuestions = async () => {
        const filteredQuestionsList = selectedTopic ? await getQuestionsByTopic(topics, selectedTopic) : null;
        filteredQuestionsList ? setQuestions(filteredQuestionsList) : null;
    };

    const setInterestsList = () => {
        let interestsAsModel: InterestModel[] = [];

        // Map user interests
        if (user && user.interests) {
            //console.log("setting interests for user: " + user.full_name);
            interestsAsModel = user.interests.map(interest => ({
                interest,
                selected: false
            }));
        }

        // Append major and minor from academics
        if (user && user.academics) {
            const major = user.academics.Major;
            const minor = user.academics.Minor;
            if (major) {
                interestsAsModel.push({
                    interest: major + " Major",
                    selected: false
                });
            }
            if (minor) {
                interestsAsModel.push({
                    interest: minor + " Minor",
                    selected: false
                });
            }
        }

        // Append ethnicity from demographics
        if (user && user.demographics) {
            const ethnicity = user.demographics.Ethnicity;
            if (ethnicity && ethnicity.toLowerCase() != "white") {
                interestsAsModel.push({
                    interest: ethnicity + " ethnicity",
                    selected: false
                });
            }
        }
        setCheckedInterests(interestsAsModel);
        setInterests(interestsAsModel);
    };
    const clearChat = () => {
        lastQuestionRef.current = "";
        error && setError(undefined);
        setActiveCitation(undefined);
        setChatHistory([]);
        setActiveConversation(null);
        setConversationId(uuid().toString());
    };

    const onShowCitation = (citation: string) => {
        if (activeCitation === citation) {
            setIsCitationPanelOpen(false);
        } else {
            setActiveCitation(citation);
            //console.log("citation set to " + activeCitation);
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

    const handleInterestChange = (interest: InterestModel) => {
        console.log(`Handling interest change for interest ${JSON.stringify(interest)}`);

        // Call setCheckedInterests to update the state.
        setCheckedInterests(prevInterests => {
            console.log("Previous checked interests:", JSON.stringify(prevInterests));

            // Create a new array using the map method, where each item is updated based on the condition.
            const updatedInterests = prevInterests.map(item => {
                // Check if the current item's interest property matches the interest property of the incoming interest object.
                if (item.interest.toLowerCase() === interest.interest.toLowerCase()) {
                    // If there's a match, log the change, then return a new object with the selected property updated to match interest.selected.
                    console.log(`Updating selected status of interest ${item.interest} from ${item.selected} to ${interest.selected}`);
                    return { ...item, selected: interest.selected };
                }
                // If there's no match, return the item unmodified.
                return item;
            });

            console.log("Updated checked interests:", JSON.stringify(updatedInterests));

            // Return the updated interests array to complete the state update.
            return updatedInterests;
        });
    };

    const startNewChat = () => {
        //console.log("Starting new chat");
        clearChat();
        setIsNewConversation(true);
        setConversationId(uuid().toString());
    };

    const makeConversationsApiRequest = async () => {
        if (selectedProfile != "" && selectedProfile != "none") {
            setIsLoading(true);
            try {
                const result = await conversationsApi();
                setConversations(result);
            } catch (e) {
                setError(e);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const makeApiRequest = async (question: string) => {
        console.log("making api request with question: " + question);
        const asr: AskResponse = createDefaultAskResponse();
        setIsLoading(true);
        // Step 1: Add the new question with a blank response to chatHistory.
        setChatHistory((prevHistory: [user: string, response: AskResponse][]) => {
            const updatedHistory: [user: string, response: AskResponse][] = [...prevHistory, [question, asr]];
            // Move your API call inside the setChatHistory callback to ensure it's using the updated chatHistory.
            makeApiCall(updatedHistory, question);

            return updatedHistory; // Return updated history to update the state.
        });
    };

    const makeApiCall = async (updatedHistory: [string, AskResponse][], question: string) => {
        try {
            const result = await chatApi(question, updatedHistory, conversationId, isNewConversation);
            // Step 2: Update the last item in updatedHistory to include the response.
            const updatedChatHistory = [...updatedHistory];
            updatedChatHistory[updatedChatHistory.length - 1] = [question, result]; // Update the response of the last item.
            setChatHistory(updatedChatHistory);

            setConversationId(result.conversation_id);
        } catch (e) {
            // Handle errors from chatApi.
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading];
    }, []);

    useEffect(() => {
        //don't call on initial render
        if (topics.length > 0 && (topics !== prevTopicsRef.current || checkedInterests !== prevCheckedInterestsRef.current)) {
            //console.log("getting topics for user based on topics list " + JSON.stringify(topics, null, 2));
            updateTopics();
            prevTopicsRef.current = topics;
            prevCheckedInterestsRef.current = checkedInterests;
        } else {
        }
    }, [checkedInterests, user, topics]);

    useEffect(() => {
        //console.log("questions: ", questionsList);
        updateQuestions();
    }, [selectedTopic]);

    useEffect(() => {
        if (user) {
            setInterestsList();
            updateTopics();
            setConversations(undefined);
            setIsNewConversation(true);
            clearChat();
            makeConversationsApiRequest();
        }
    }, [user]);

    useEffect(() => {
        console.log("new active conversation detected:" + activeConversation?.id);
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
        setChatHistory(answers.reverse().map(x => [x[0], JSON.parse(x[1])]));
    }, [activeConversation]);

    useEffect(() => {
        setLocalStorage<string>("conversationId", conversationId);
    }, [conversationId]);

    useEffect(() => {
        setLocalStorage("isNewChat", isNewConversation);
    }, [isNewConversation]);

    // wiring up of profile popover to header button
    const { showProfile } = useShowProfile();
    const handleOpenChange: PopoverProps["onOpenChange"] = (e, data) => setProfilePopOpen(data.open || false);
    const { profilePopAnchor } = useProfilePopAnchor();
    const profilePopPositioningRef = useRef<PositioningImperativeRef>(null);

    useEffect(() => {
        console.log("showProfile state change: ", showProfile);
        setProfilePopOpen(showProfile);
    }, [showProfile]);

    useEffect(() => {
        if (profilePopAnchor) {
            profilePopPositioningRef.current?.setTarget(profilePopAnchor);
        }
    }, [profilePopAnchor, profilePopPositioningRef]);

    let profile: ProfileModel = createDefaultProfile();
    if (user != null) profile = user;

    return (
        <>
            <div className={styles.container}>
                <Popover onOpenChange={handleOpenChange} open={profilePopOpen} positioning={{ positioningRef: profilePopPositioningRef }}>
                    <PopoverSurface style={{ backgroundColor: "lightgray" }}>
                        <ProfilePopover
                            profile={profile}
                            interestList={interestList}
                            onInterestChanged={handleInterestChange}
                            onLogout={() => {
                                setProfilePopOpen(false);
                                setUser(null);
                                setSelectedProfile("");
                            }}
                        ></ProfilePopover>
                    </PopoverSurface>
                </Popover>

                <div className={styles.chatSection}>
                    <Stack horizontal horizontalAlign="stretch">
                        <StackItem
                            className={styles.chatHistoryContainer}
                            disableShrink
                            style={{
                                display: selectedProfile === "none" ? "none" : "block"
                            }}
                        >
                            <UserConversations //chat history
                                conversations={conversationsList}
                                onConversationClicked={onConversationSelected}
                                onNewChatClicked={() => startNewChat()}
                            />
                        </StackItem>
                        <StackItem className={styles.chatInputContainer}>
                            <ChatContainer
                                examples={topicsList ? topicsList : []}
                                answers={chatHistory}
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
        </>
    );
};

export default Chat;
