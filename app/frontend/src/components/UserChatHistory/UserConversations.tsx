import { Stack, StackItem, List } from "@fluentui/react";
import { Subtitle2, MenuList, MenuItemRadio, Button } from "@fluentui/react-components";
import { ConversationsModel } from "../../api";
import { useState } from "react";
import { Folder16Regular, Chat16Filled } from "@fluentui/react-icons";
import type { MenuProps } from "@fluentui/react-components";

import styles from "./UserConversations.module.css";

interface Props {
    conversations: Array<ConversationsModel>;
    onCitationClicked: (filePath: string) => void;
    onConversationClicked: (conversationId: string) => void;
    onNewChatClicked: () => void;
}

const timestampFormat = (timestamp: string): string => {
    let numericTimestamp = parseInt(timestamp) * 1000;
    let dateTime = new Date(numericTimestamp);
    return dateTime.toLocaleDateString() + " " + dateTime.toLocaleTimeString();
};

export const UserConversations = ({ conversations, onCitationClicked, onConversationClicked, onNewChatClicked }: Props) => {
    const [checkedValues, setCheckedValues] = useState<Record<string, string[]>>({ conversation: [""] });
    const onChange: MenuProps["onCheckedValueChange"] = (e, { name, checkedItems }) => {
        setCheckedValues(s => ({ ...s, [name]: checkedItems }));
        onConversationClicked(checkedItems[0]);
        console.log("detected new value change");
    };

    const [selectedMenuItem, setSelectedMenuItem] = useState<HTMLTableRowElement | null>(null);

    return (
        <>
            <Stack horizontal horizontalAlign="stretch" className={styles.convoMenuHeader}>
                <StackItem disableShrink className={styles.convoHeaderContainer}>
                    <h2>Chat History</h2>
                </StackItem>
                <StackItem className={styles.convoActionContainer}>
                    <Button shape="rounded" size="small" onClick={onNewChatClicked}>
                        New Chat
                    </Button>
                </StackItem>
            </Stack>

            <table className={styles.convoTable}>
                {conversations.map((x, i) => (
                    <tr
                        className={styles.convoUnhovered}
                        onMouseEnter={el => {
                            if (el.currentTarget.className != styles.convoSelected) el.currentTarget.className = styles.convoHovered;
                        }}
                        onMouseLeave={el => {
                            if (el.currentTarget.className != styles.convoSelected) el.currentTarget.className = styles.convoUnhoverd;
                        }}
                        onClick={el => {
                            el.currentTarget.className = styles.convoSelected;
                            if (selectedMenuItem != null) selectedMenuItem.className = styles.convoUnhovered;
                            onConversationClicked(x.id);
                            setSelectedMenuItem(el.currentTarget);
                        }}
                    >
                        <td className={styles.convoMenuItem}>
                            <div className={styles.convoMenuIconPadding}>
                                <Chat16Filled />
                                <Subtitle2 className={styles.labelPadding}>{x.topic}</Subtitle2>
                            </div>
                        </td>
                    </tr>
                ))}
            </table>
        </>
    );
};
