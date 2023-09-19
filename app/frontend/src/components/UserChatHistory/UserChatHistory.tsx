import { List } from "@fluentui/react";
import { Accordion } from "@fluentui/react-components";
import { ChatHistoryMessageModel } from "../../api";
import { ChatHistoryMessage } from "./ChatHistoryMessage";

import styles from "./UserChatHistory.module.css";

interface Props {
    history: Array<ChatHistoryMessageModel>;
}

export const UserChatHistory = ({ history }: Props) => {
    return (
        <Accordion multiple collapsible>
            {history.map((x, i) => (
                <ChatHistoryMessage index={i} message={x} />
            ))}
        </Accordion>
    );
};
