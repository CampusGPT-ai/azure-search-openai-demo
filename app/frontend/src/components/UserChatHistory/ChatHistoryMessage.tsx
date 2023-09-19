import { AccordionHeader, AccordionItem, AccordionPanel } from "@fluentui/react-components";

import { ChatHistoryMessageModel } from "../../api";
import { Answer } from "../Answer";
import { AskResponse } from "../../api";

import styles from "./ChatHistoryMessage.module.css";

interface Props {
    index: number;
    message: ChatHistoryMessageModel;
}

export const ChatHistoryMessage = ({ index, message }: Props) => {
    let askResponse: AskResponse = { answer: message.bot, thoughts: null, follow_up: [], data_points: [] };
    return (
        <AccordionItem value={index}>
            <AccordionHeader as="h4">{message.user}</AccordionHeader>
            <AccordionPanel className={styles.container}>
                <Answer
                    key={index}
                    answer={askResponse}
                    isSelected={true}
                    onCitationClicked={() => {
                        void 0;
                    }}
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
