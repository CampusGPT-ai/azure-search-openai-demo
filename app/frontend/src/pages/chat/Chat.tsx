import { useRef, useState, useEffect } from "react";
import { getLocalStorage, setLocalStorage } from "../../utilities/stateManagement";
import { v4 as uuid } from "uuid";
import { Checkbox, Panel, DefaultButton, TextField, SpinButton, Dropdown, IDropdownOption, Stack, StackItem } from "@fluentui/react";
import { Drawer, DrawerOverlay, DrawerBody, DrawerHeader, DrawerHeaderTitle } from "@fluentui/react-components/unstable";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { Button } from "@fluentui/react-components";

import { chatApi, RetrievalMode, Approaches, AskResponse, ChatRequest, ChatTurn } from "../../api";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import { AnalysisPanel, AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { ConversationsResponse, ConversationsModel, ChatHistoryMessageModel } from "../../api";
import { conversationsApi } from "../../api";
import { interestsAllApi, currentProfileApi } from "../../api";
import { InterestsResponse, InterestModel, ProfileModel } from "../../api";

import styles from "./Chat.module.css";
import { InterestList } from "../../components/Interests/InterestList";
import { UserConversations } from "../../components/UserChatHistory/UserConversations";

const Chat = () => {
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [isCitationPanelOpen, setIsCitationPanelOpen] = useState(false);
    const [promptTemplate, setPromptTemplate] = useState<string>("");
    const [retrieveCount, setRetrieveCount] = useState<number>(3);
    const [retrievalMode, setRetrievalMode] = useState<RetrievalMode>(RetrievalMode.Hybrid);
    const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
    const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
    const [excludeCategory, setExcludeCategory] = useState<string>("");
    const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] = useState<boolean>(false);

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);

    const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
    const [answers, setAnswers] = useState<[user: string, response: AskResponse][]>([]);

    const [conversations, setConversations] = useState<ConversationsResponse | undefined>(undefined);
    const [interests, setInterests] = useState<InterestsResponse | undefined>(undefined);

    const [isNewConversation, setIsNewConversation] = useState<boolean>(getLocalStorage<boolean>("isNewConversation") || false);
    const [conversationId, setConversationId] = useState<string>(getLocalStorage<string>("conversationId") || uuid().toString());
    const [activeConversation, setActiveConversation] = useState<ConversationsModel | null>(null);
    const [currentUser, setCurrentUser] = useState<ProfileModel | null>(null);

    const makeApiRequest = async (question: string) => {
        console.log("Asking question: " + question);
        console.log("Conversation id: " + conversationId);
        if (isNewConversation) console.log("Starting a new conversation...");

        console.log("Making API call to OpenAI...");

        lastQuestionRef.current = question;

        error && setError(undefined);
        setIsLoading(true);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);

        try {
            const history: ChatTurn[] = answers.map(a => ({ user: a[0], bot: a[1].answer }));
            const request: ChatRequest = {
                history: [...history, { user: question, bot: undefined }],
                approach: Approaches.ReadRetrieveRead,
                overrides: {
                    conversationId: conversationId,
                    isNewConversation: isNewConversation,
                    promptTemplate: promptTemplate.length === 0 ? undefined : promptTemplate,
                    excludeCategory: excludeCategory.length === 0 ? undefined : excludeCategory,
                    top: retrieveCount,
                    retrievalMode: retrievalMode,
                    semanticRanker: useSemanticRanker,
                    semanticCaptions: useSemanticCaptions,
                    suggestFollowupQuestions: true
                }
            };
            const result = await chatApi(request);
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
                //setActiveConversation(convo);
            }
            setIsNewConversation(false);
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

    useEffect(() => {
        makeCurrentUserApiRequest();
        chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading];
    }, []);

    useEffect(() => {
        setConversationId(uuid().toString());
        setConversations(undefined);
        setInterests(undefined);
        setIsNewConversation(true);
        clearChat();
        makeConversationsApiRequest();
        makeInterestApiRequest();
    }, [currentUser]);

    const clearChat = () => {
        lastQuestionRef.current = "";
        error && setError(undefined);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);
        setAnswers([]);
    };

    const onPromptTemplateChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setPromptTemplate(newValue || "");
    };

    const onRetrieveCountChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setRetrieveCount(parseInt(newValue || "3"));
    };

    const onRetrievalModeChange = (_ev: React.FormEvent<HTMLDivElement>, option?: IDropdownOption<RetrievalMode> | undefined, index?: number | undefined) => {
        setRetrievalMode(option?.data || RetrievalMode.Hybrid);
    };

    const onUseSemanticRankerChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticRanker(!!checked);
    };

    const onUseSemanticCaptionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSemanticCaptions(!!checked);
    };

    const onExcludeCategoryChanged = (_ev?: React.FormEvent, newValue?: string) => {
        setExcludeCategory(newValue || "");
    };

    const onUseSuggestFollowupQuestionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSuggestFollowupQuestions(!!checked);
    };

    const onExampleClicked = (example: string) => {
        makeApiRequest(example);
    };

    const onDrawerClose = (closed: boolean) => {
        setIsCitationPanelOpen(closed);
    };

    const onShowCitation = (citation: string, index: number) => {
        if (activeCitation === citation && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
            setIsCitationPanelOpen(false);
        } else {
            setActiveCitation(citation);
            setIsCitationPanelOpen(true);
        }

        setSelectedAnswer(index);
    };

    const onShowCitationFromHistory = (citation: string) => {
        if (activeCitation === citation) {
            setIsCitationPanelOpen(false);
        } else {
            setActiveCitation(citation);
            setIsCitationPanelOpen(true);
        }
    };

    const onConversationSelected = (conversationId: string) => {
        console.log("Conversation selected: id=" + conversationId);
        if (conversations != null) {
            conversations.list.forEach(el => {
                if (el.id == conversationId) {
                    console.log("Found conversation with topic: " + el.topic);
                    setActiveConversation(el);
                    setConversationId(el.id);
                }
            });
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

    const onToggleTab = (tab: AnalysisPanelTabs, index: number) => {
        if (activeAnalysisPanelTab === tab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveAnalysisPanelTab(tab);
        }

        setSelectedAnswer(index);
    };

    const makeInterestApiRequest = async () => {
        setIsLoading(true);
        try {
            const result = await interestsAllApi();
            setInterests(result);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

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

    let interestList: Array<InterestModel> = [];
    if (interests?.list) interestList = interests.list;

    let conversationsList: Array<ConversationsModel> = [];
    if (conversations?.list) conversationsList = conversations.list;

    return (
        <div className={styles.container}>
            <div className={styles.contentHeader}>
                <h2>Your Interests</h2>
                <div className={styles.contentSection}>
                    <InterestList list={interestList} />
                </div>
            </div>
            <div className={styles.contentHeader}>
                <h2>Trending Topics</h2>
                <div className={styles.contentSection}>
                    <InterestList list={interestList} />
                </div>
            </div>
            <div className={styles.chatSection}>
                <Stack horizontal horizontalAlign="stretch">
                    <StackItem className={styles.chatHistoryContainer} disableShrink>
                        <UserConversations
                            conversations={conversationsList}
                            onCitationClicked={c => onShowCitationFromHistory(c)}
                            onConversationClicked={onConversationSelected}
                            onNewChatClicked={() => startNewChat()}
                        />
                    </StackItem>
                    <StackItem className={styles.chatInputContainer}>
                        <h2>What's on your mind today?</h2>
                        {!lastQuestionRef.current ? (
                            <div className={styles.chatEmptyState}>
                                <h3 className={styles.chatEmptyStateSubtitle}>Ask a question in chat or try one of the examples to get started</h3>
                                <ExampleList onExampleClicked={onExampleClicked} />
                            </div>
                        ) : (
                            <div className={styles.chatMessageStream}>
                                {answers.map((answer, index) => (
                                    <div key={index}>
                                        <UserChatMessage message={answer[0]} />
                                        <div className={styles.chatMessageGpt}>
                                            <Answer
                                                key={index}
                                                answer={answer[1]}
                                                isSelected={selectedAnswer === index && activeAnalysisPanelTab !== undefined}
                                                onCitationClicked={c => onShowCitation(c, index)}
                                                onThoughtProcessClicked={() => onToggleTab(AnalysisPanelTabs.ThoughtProcessTab, index)}
                                                onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab, index)}
                                                onFollowupQuestionClicked={q => makeApiRequest(q)}
                                                showFollowupQuestions={answers.length - 1 === index}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <>
                                        <UserChatMessage message={lastQuestionRef.current} />
                                        <div className={styles.chatMessageGptMinWidth}>
                                            <AnswerLoading />
                                        </div>
                                    </>
                                )}
                                {error ? (
                                    <>
                                        <UserChatMessage message={lastQuestionRef.current} />
                                        <div className={styles.chatMessageGptMinWidth}>
                                            <AnswerError error={error.toString()} onRetry={() => makeApiRequest(lastQuestionRef.current)} />
                                        </div>
                                    </>
                                ) : null}
                                <div ref={chatMessageStreamEnd} />
                            </div>
                        )}

                        <div className={styles.chatInput}>
                            <QuestionInput
                                clearOnSend
                                placeholder="Type a new question (e.g. How can I get help picking courses for next semester?)"
                                disabled={isLoading}
                                onSend={question => makeApiRequest(question)}
                            />

                            <DrawerOverlay
                                className={styles.citationPanelContainer}
                                open={isCitationPanelOpen}
                                onOpenChange={(_, { open }) => onDrawerClose(open)}
                                size="large"
                                position="end"
                            >
                                <DrawerHeader className={styles.citationPanelHeader}>
                                    <DrawerHeaderTitle
                                        className={styles.citationPanelHeaderTitle}
                                        action={
                                            <Button appearance="subtle" aria-label="Close" icon={<Dismiss24Regular />} onClick={() => onDrawerClose(false)} />
                                        }
                                    >
                                        Citation source
                                    </DrawerHeaderTitle>
                                </DrawerHeader>
                                <DrawerBody>
                                    <iframe title="Citation" src={activeCitation} width="100%" height="810px" />
                                </DrawerBody>
                            </DrawerOverlay>

                            <Panel
                                headerText="Configure answer generation"
                                isOpen={isConfigPanelOpen}
                                isBlocking={false}
                                onDismiss={() => setIsConfigPanelOpen(false)}
                                closeButtonAriaLabel="Close"
                                onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
                                isFooterAtBottom={true}
                            >
                                <TextField
                                    className={styles.chatSettingsSeparator}
                                    defaultValue={promptTemplate}
                                    label="Override prompt template"
                                    multiline
                                    autoAdjustHeight
                                    onChange={onPromptTemplateChange}
                                />

                                <SpinButton
                                    className={styles.chatSettingsSeparator}
                                    label="Retrieve this many documents from search:"
                                    min={1}
                                    max={50}
                                    defaultValue={retrieveCount.toString()}
                                    onChange={onRetrieveCountChange}
                                />
                                <TextField className={styles.chatSettingsSeparator} label="Exclude category" onChange={onExcludeCategoryChanged} />
                                <Checkbox
                                    className={styles.chatSettingsSeparator}
                                    checked={useSemanticRanker}
                                    label="Use semantic ranker for retrieval"
                                    onChange={onUseSemanticRankerChange}
                                />
                                <Checkbox
                                    className={styles.chatSettingsSeparator}
                                    checked={useSemanticCaptions}
                                    label="Use query-contextual summaries instead of whole documents"
                                    onChange={onUseSemanticCaptionsChange}
                                    disabled={!useSemanticRanker}
                                />
                                <Checkbox
                                    className={styles.chatSettingsSeparator}
                                    checked={useSuggestFollowupQuestions}
                                    label="Suggest follow-up questions"
                                    onChange={onUseSuggestFollowupQuestionsChange}
                                />
                                <Dropdown
                                    className={styles.chatSettingsSeparator}
                                    label="Retrieval mode"
                                    options={[
                                        {
                                            key: "hybrid",
                                            text: "Vectors + Text (Hybrid)",
                                            selected: retrievalMode == RetrievalMode.Hybrid,
                                            data: RetrievalMode.Hybrid
                                        },
                                        { key: "vectors", text: "Vectors", selected: retrievalMode == RetrievalMode.Vectors, data: RetrievalMode.Vectors },
                                        { key: "text", text: "Text", selected: retrievalMode == RetrievalMode.Text, data: RetrievalMode.Text }
                                    ]}
                                    required
                                    onChange={onRetrievalModeChange}
                                />
                            </Panel>
                        </div>
                    </StackItem>
                </Stack>
            </div>
        </div>
    );
};

export default Chat;
