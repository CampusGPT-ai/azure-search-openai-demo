import { List } from "@fluentui/react";
import { Accordion } from "@fluentui/react-components";
import { ChatHistoryMessageModel } from "../../api";
import { ChatHistoryMessage } from "./ChatHistoryMessage";

import styles from "./UserChatHistory.module.css";

interface Props {
    history: Array<ChatHistoryMessageModel>;
    onCitationClicked: (filePath: string) => void;
}
/**
 * passes chat history from interactions table to accordion, message includes ask and response (user bot).
 * creates new message component for each interaction
 *
 * @returns
 */
export const UserChatHistory = ({ history, onCitationClicked }: Props) => {
    return (
        <Accordion multiple collapsible>
            {history.map((x, i) => (
                <ChatHistoryMessage index={i} message={x} onCitationClicked={onCitationClicked} />
            ))}
        </Accordion>
    );
};
