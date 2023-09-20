import { useRef, useState, useEffect } from "react";
import { Checkbox, Panel, DefaultButton, TextField, SpinButton, Dropdown, IDropdownOption } from "@fluentui/react";
import { Drawer, DrawerOverlay, DrawerBody, DrawerHeader, DrawerHeaderTitle } from "@fluentui/react-components/unstable";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { Button } from "@fluentui/react-components";

import { chatApi, RetrievalMode, Approaches, AskResponse, ChatRequest, ChatTurn } from "../../api";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import { AnalysisPanel, AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { SettingsButton } from "../../components/SettingsButton";
import { ClearChatButton } from "../../components/ClearChatButton";
import { UserChatHistory } from "../../components/UserChatHistory/UserChatHistory";
import { ChatHistoryResponse, ChatHistoryMessageModel } from "../../api";
import { chatHistoryApi } from "../../api";
import { interestsAllApi } from "../../api";
import { InterestsResponse, InterestModel } from "../../api";

import styles from "./Chat.module.css";
import { InterestList } from "../../components/Interests/InterestList";

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

    const [chatHistory, setChatHistory] = useState<ChatHistoryResponse | undefined>(undefined);
    const [interests, setInterests] = useState<InterestsResponse | undefined>(undefined);

    const makeApiRequest = async (question: string) => {
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
                    promptTemplate: promptTemplate.length === 0 ? undefined : promptTemplate,
                    excludeCategory: excludeCategory.length === 0 ? undefined : excludeCategory,
                    top: retrieveCount,
                    retrievalMode: retrievalMode,
                    semanticRanker: useSemanticRanker,
                    semanticCaptions: useSemanticCaptions,
                    suggestFollowupQuestions: useSuggestFollowupQuestions
                }
            };
            const result = await chatApi(request);
            setAnswers([...answers, [question, result]]);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const makeHistoryApiRequest = async () => {
        setIsLoading(true);
        try {
            const result = await chatHistoryApi();
            setChatHistory(result);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        makeHistoryApiRequest();
        makeInterestApiRequest();
        chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading];
    }, []);

    let chatHistoryMessages: Array<ChatHistoryMessageModel> = [];
    if (chatHistory?.list) chatHistoryMessages = chatHistory.list;

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

    let interestList: Array<InterestModel> = [];
    if (interests?.list) interestList = interests.list;

    return (
        <div className={styles.container}>
            <div className={styles.commandsContainer}>
                <ClearChatButton className={styles.commandButton} onClick={clearChat} disabled={!lastQuestionRef.current || isLoading} />
                <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
            </div>
            <div className={styles.contentSection}>
                <h1>Your Interests</h1>
                <InterestList list={interestList} />
            </div>
            <div className={styles.contentSection}>
                <h1>Trending Topics</h1>
            </div>
            <div className={styles.historyAndChatGrid}>
                <div className={styles.contentSection}>
                    <h2>Chat History</h2>
                    <UserChatHistory history={chatHistoryMessages} onCitationClicked={c => onShowCitationFromHistory(c)} />
                </div>
                <div className={[styles.contentSection, styles.chatRoot].filter(item => !!item).join(" ")}>
                    <div className={styles.chatContainer}>
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
                                                showFollowupQuestions={useSuggestFollowupQuestions && answers.length - 1 === index}
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
                                placeholder="Type a new question (e.g. does my plan cover annual eye exams?)"
                                disabled={isLoading}
                                onSend={question => makeApiRequest(question)}
                            />
                        </div>
                    </div>

                    {answers.length > 0 && activeAnalysisPanelTab && (
                        <AnalysisPanel
                            className={styles.chatAnalysisPanel}
                            activeCitation={activeCitation}
                            onActiveTabChanged={x => onToggleTab(x, selectedAnswer)}
                            citationHeight="810px"
                            answer={answers[selectedAnswer][1]}
                            activeTab={activeAnalysisPanelTab}
                        />
                    )}

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
                                action={<Button appearance="subtle" aria-label="Close" icon={<Dismiss24Regular />} onClick={() => onDrawerClose(false)} />}
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
                                { key: "hybrid", text: "Vectors + Text (Hybrid)", selected: retrievalMode == RetrievalMode.Hybrid, data: RetrievalMode.Hybrid },
                                { key: "vectors", text: "Vectors", selected: retrievalMode == RetrievalMode.Vectors, data: RetrievalMode.Vectors },
                                { key: "text", text: "Text", selected: retrievalMode == RetrievalMode.Text, data: RetrievalMode.Text }
                            ]}
                            required
                            onChange={onRetrievalModeChange}
                        />
                    </Panel>
                </div>
            </div>
        </div>
    );
};

export default Chat;
