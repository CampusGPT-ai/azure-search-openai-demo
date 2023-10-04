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
/**
 * UserConversations Component
 * 
 * This component displays a list of chat conversations for the user. 
 * Each conversation can be clicked to see its content, and there is a button to start a new chat.
 * 
 * @param {object} props - The properties passed to the component.
 * @param {Array} props.conversations - The list of conversations.
 * @param {Function} props.onCitationClicked - Handler for when a citation is clicked.
 * @param {Function} props.onConversationClicked - Handler for when a conversation is clicked.
 * @param {Function} props.onNewChatClicked - Handler for when the new chat button is clicked.
 */
export const UserConversations = ({ conversations, onCitationClicked, onConversationClicked, onNewChatClicked }: Props) => {
    // State for tracking which conversation items are checked
    const [checkedValues, setCheckedValues] = useState<Record<string, string[]>>({ conversation: [""] });
    
    // Handler for when a conversation item's checked value changes
    const onChange: MenuProps["onCheckedValueChange"] = (e, { name, checkedItems }) => {
        setCheckedValues(s => ({ ...s, [name]: checkedItems }));
        onConversationClicked(checkedItems[0]);
        console.log("detected new value change");
    };

    // State for tracking which menu item (conversation) is currently selected
    const [selectedMenuItem, setSelectedMenuItem] = useState<HTMLTableRowElement | null>(null);

    return (
        <>
            {/* Header Section */}
            <Stack horizontal horizontalAlign="stretch" className={styles.convoMenuHeader}>
                {/* Title */}
                <StackItem disableShrink className={styles.convoHeaderContainer}>
                    <h2>Chat History</h2>
                </StackItem>
                {/* New Chat Button */}
                <StackItem className={styles.convoActionContainer}>
                    <Button shape="rounded" size="small" onClick={onNewChatClicked}>
                        New Chat
                    </Button>
                </StackItem>
            </Stack>

            {/* Conversations List */}
            <table className={styles.convoTable}>
                {conversations.map((x, i) => (
                    <tr
                        className={styles.convoUnhovered}
                        // On hover, highlight the conversation row
                        onMouseEnter={el => {
                            if (el.currentTarget.className != styles.convoSelected) el.currentTarget.className = styles.convoHovered;
                        }}
                        // On mouse leave, unhighlight the conversation row unless it's selected
                        onMouseLeave={el => {
                            if (el.currentTarget.className != styles.convoSelected) el.currentTarget.className = styles.convoUnhovered;
                        }}
                        // On click, mark the conversation as selected and trigger the onConversationClicked event
                        onClick={el => {
                            el.currentTarget.className = styles.convoSelected;
                            if (selectedMenuItem != null) selectedMenuItem.className = styles.convoUnhovered;
                            onConversationClicked(x.id);
                            setSelectedMenuItem(el.currentTarget);
                        }}
                    >
                        {/* Conversation item with icon and topic */}
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

