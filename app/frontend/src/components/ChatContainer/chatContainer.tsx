import { useRef, useState, useEffect } from "react";

import { AskResponse } from "../../api";
import { QuestionInput } from "../QuestionInput";
import { Answer, AnswerError, AnswerLoading } from "../Answer";
import { ExampleList } from "../Example";
import { UserChatMessage } from "../UserChatMessage";

import styles from "../../pages/chat/Chat.module.css";

type Props = {
    answers: [user: string, response: AskResponse][];
    onShowCitation: (citation: string) => void;
    makeApiRequest: (question: string) => void;
    isLoading: boolean;
    error: unknown;
};

const ChatContainer = ({ answers, onShowCitation, makeApiRequest, isLoading, error }: Props) => {
    const lastItem = answers.length > 0 ? answers[answers.length - 1] : undefined;
    const [lastQuestion, setLastQuestion] = useState<[user: string, response: AskResponse] | undefined>(lastItem);
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" });
        setLastQuestion(answers[answers.length - 1]);
    }, [answers]);

    const onExampleClicked = async (example: string) => {
        makeApiRequest(example);
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerText}>
                <h2>What's on your mind today?</h2>
            </div>
            {/*get a reference to whether the last question is empty - ie has a question been asked.  
            if not, show the example list, otherwise just show the answers*/}
            {answers.length === 0 ? (
                <div className={styles.chatEmptyState}>
                    <h3 className={styles.chatEmptyStateSubtitle}>Ask a question in chat or try one of the examples to get started</h3>
                    <ExampleList onExampleClicked={onExampleClicked} />
                </div>
            ) : (
                <div className={styles.chatMessageStream}>
                    {/** show Q&A  */}
                    {answers.map((answer, index) => (
                        <div key={index}>
                            <UserChatMessage message={answer[0]} />
                            <div className={styles.chatMessageGpt}>
                                <Answer
                                    key={index}
                                    answer={answer[1]}
                                    onCitationClicked={c => {
                                        //console.log("citation click event registered for: " + c);
                                        onShowCitation(c);
                                    }}
                                    onFollowupQuestionClicked={q => {
                                        makeApiRequest(q);
                                    }}
                                    showFollowupQuestions={answers.length - 1 === index}
                                />
                            </div>
                        </div>
                    ))}
                    {/**handle loading and err states */}
                    {isLoading && lastQuestion && (
                        <div>
                            <UserChatMessage message={lastQuestion[0]} />
                            <div className={styles.chatMessageGptMinWidth}>
                                <AnswerLoading />
                            </div>
                        </div>
                    )}

                    {lastQuestion && error ? (
                        <div>
                            <UserChatMessage message={lastQuestion[0]} />
                            <div className={styles.chatMessageGptMinWidth}>
                                <AnswerError
                                    error={error.toString()}
                                    onRetry={() => {
                                        makeApiRequest(lastQuestion[0]);
                                    }}
                                />
                            </div>
                        </div>
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
            </div>
        </div>
    );
};
export default ChatContainer;
