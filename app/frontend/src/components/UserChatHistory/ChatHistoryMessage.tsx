import { AccordionHeader, AccordionItem, AccordionPanel, Badge } from "@fluentui/react-components";

import { ChatHistoryMessageModel } from "../../api";
import { Answer } from "../Answer";
import { AskResponse } from "../../api";

import styles from "./ChatHistoryMessage.module.css";

interface Props {
    index: number;
    message: ChatHistoryMessageModel;
    onCitationClicked: (filePath: string) => void;
}

const timestampFormat = (timestamp: string): string => {
    let numericTimestamp = parseInt(timestamp) * 1000;
    let dateTime = new Date(numericTimestamp);
    return dateTime.toLocaleDateString() + " " + dateTime.toLocaleTimeString();
};

export const ChatHistoryMessage = ({ index, message, onCitationClicked }: Props) => {
    let askResponse: AskResponse = { answer: message.bot, thoughts: null, follow_up: [], data_points: [] };

    return (
        <AccordionItem value={index}>
            <AccordionHeader as="div">
                <h4 className={styles.userQuestion}>{message.user}</h4>
                <Badge appearance="tint">{timestampFormat(message.timestamp)}</Badge>
            </AccordionHeader>
            <AccordionPanel className={styles.container}>
                <Answer
                    key={index}
                    answer={askResponse}
                    isSelected={true}
                    onCitationClicked={onCitationClicked}
                    onThoughtProcessClicked={() => {
                        void 0;
                    }}
                    onSupportingContentClicked={() => {
                        void 0;
                    }}
                    showFollowupQuestions={false}
                />
            </AccordionPanel>
        </AccordionItem>
    );
};
