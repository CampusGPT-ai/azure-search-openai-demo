import { List } from "@fluentui/react";
import { Badge, Subtitle2, MenuList, MenuItemRadio } from "@fluentui/react-components";
import { ConversationsModel } from "../../api";
import { useState } from "react";
import type { MenuProps } from "@fluentui/react-components";

import styles from "./UserChatHistory.module.css";
import { UserChatHistory } from "./UserChatHistory";

interface Props {
    conversations: Array<ConversationsModel>;
    onCitationClicked: (filePath: string) => void;
    onConversationClicked: (conversationId: string) => void;
}

const timestampFormat = (timestamp: string): string => {
    let numericTimestamp = parseInt(timestamp) * 1000;
    let dateTime = new Date(numericTimestamp);
    return dateTime.toLocaleDateString() + " " + dateTime.toLocaleTimeString();
};

export const UserConversations = ({ conversations, onCitationClicked, onConversationClicked }: Props) => {
    const [checkedValues, setCheckedValues] = useState<Record<string, string[]>>({ conversation: [""] });
    const onChange: MenuProps["onCheckedValueChange"] = (e, { name, checkedItems }) => {
        setCheckedValues(s => ({ ...s, [name]: checkedItems }));
        onConversationClicked(checkedItems[0]);
        console.log("detected new value change");
    };
    return (
        <MenuList checkedValues={checkedValues} onCheckedValueChange={onChange}>
            {conversations.map((x, i) => (
                <MenuItemRadio name="conversation" value={x.id}>
                    <Subtitle2 className={styles.labelPadding}>{x.topic}</Subtitle2>
                </MenuItemRadio>
            ))}
        </MenuList>
    );
};
