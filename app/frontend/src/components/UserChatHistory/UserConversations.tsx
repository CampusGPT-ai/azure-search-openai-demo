import { List } from "@fluentui/react";
import { Badge, Subtitle2 } from "@fluentui/react-components";
import { ConversationsModel } from "../../api";

import styles from "./UserChatHistory.module.css";
import { UserChatHistory } from "./UserChatHistory";

interface Props {
    conversations: Array<ConversationsModel>;
    onCitationClicked: (filePath: string) => void;
}

const timestampFormat = (timestamp: string): string => {
    let numericTimestamp = parseInt(timestamp) * 1000;
    let dateTime = new Date(numericTimestamp);
    return dateTime.toLocaleDateString() + " " + dateTime.toLocaleTimeString();
};

export const UserConversations = ({ conversations, onCitationClicked }: Props) => {
    return (
        <div>
            {conversations.map((x, i) => (
                <div>
                    <Subtitle2 className={styles.labelPadding}>{x.topic}</Subtitle2>
                    <Badge shape="rounded" appearance="tint">
                        {timestampFormat(x.start_time)}
                    </Badge>
                    <UserChatHistory history={x.interactions} onCitationClicked={onCitationClicked} />
                </div>
            ))}
        </div>
    );
};
