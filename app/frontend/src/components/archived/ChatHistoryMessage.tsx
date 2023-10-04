import { AccordionHeader, AccordionItem, AccordionPanel, Body1Strong } from "@fluentui/react-components";

import { ChatHistoryMessageModel } from "../../api";
import { Answer } from "../Answer";
import { AskResponse } from "../../api";

import styles from "./ChatHistoryMessage.module.css";

/***
 * ChatHistoryMessageModel = {
    timestamp: string;
    user: string;
    bot: string;
};

 */

interface Props {
    index: number;
    message: ChatHistoryMessageModel;
    onCitationClicked: (filePath: string) => void;
}

export const ChatHistoryMessage = ({ index, message, onCitationClicked }: Props) => {
    let askResponse: AskResponse = { conversation_id: "", conversation_topic: "", answer: message.bot, thoughts: null, follow_up: [], data_points: [] };

    return (
        <AccordionItem value={index}>
            <AccordionHeader as="div">
                <Body1Strong>{message.user}</Body1Strong>
            </AccordionHeader>
            <AccordionPanel className={styles.container}>
                <Answer key={index} answer={askResponse} onCitationClicked={onCitationClicked} showFollowupQuestions={false} />
            </AccordionPanel>
        </AccordionItem>
    );
};
