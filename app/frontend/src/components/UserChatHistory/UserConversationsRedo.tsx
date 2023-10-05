import { Stack, StackItem, DefaultButton, Button } from "@fluentui/react";
import { useState } from "react";
import { ConversationsModel } from "../../api";
import styles from "./UserConversationsRedo.module.css";
import { Folder16Regular, Chat16Filled, ChatCursor16Filled } from "@fluentui/react-icons";

import { makeStyles, Theme, shorthands } from "@fluentui/react-components";

interface Props {
    conversations: Array<ConversationsModel>;
    onConversationClicked: (conversationId: string) => void;
    onNewChatClicked: () => void;
}

const timestampFormat = (timestamp: string): string => {
    let numericTimestamp = parseInt(timestamp) * 1000;
    let dateTime = new Date(numericTimestamp);
    return dateTime.toLocaleDateString() + " " + dateTime.toLocaleTimeString();
};

const useClasses = makeStyles({
    root: {
        width: "100%",
        backgroundColor: "transparent",
        color: "#000",
        ...shorthands.borderRadius("6px"),
        ...shorthands.border("0"),
        ...shorthands.padding("10px"),
        ...shorthands.margin("10px"),
        fontSize: "14px",

        ":hover": {
            backgroundColor: "#782f40",
            color: "#fff"
        },
        ":active": {
            backgroundImage: "radial-gradient(circle, #270f15 0%, #782f40 100%)",
            color: "#fff"
        },
        ":focus": {
            backgroundColor: "#782f40",
            ...shorthands.borderColor("gray")
        },
        ":disabled": {
            backgroundColor: "gray"
        }
    },
    selected: {
        width: "100%",
        backgroundImage: "radial-gradient(circle, #270f15 0%, #782f40 100%)",
        color: "#fff",
        ...shorthands.borderRadius("6px"),
        ...shorthands.border("0"),
        ...shorthands.padding("10px"),
        ...shorthands.margin("10px")
    },
    label: {
        fontWeight: "bold",
        textAlign: "left",
        fontSize: "14px"
    }
});

export const UserConversations = ({ conversations, onConversationClicked, onNewChatClicked }: Props) => {
    const [selectedButtonId, setSelectedButtonId] = useState<string | null>(null);
    const classes = useClasses();
    return (
        <>
            <Stack horizontal horizontalAlign="stretch" className={styles.convoMenuHeader}>
                <StackItem disableShrink className={styles.convoHeaderContainer}>
                    <h2>Chat History</h2>
                </StackItem>
                <StackItem className={styles.convoActionContainer}>
                    <DefaultButton text="New Chat" onClick={onNewChatClicked} />
                </StackItem>
            </Stack>

            <div className={styles.convoButtonGroup}>
                {conversations.map((x, i) => (
                    <DefaultButton
                        key={i}
                        className={`${classes.root} ${x.id === selectedButtonId ? classes.selected : ""}`} // <-- Conditional styling for selected state
                        onClick={() => {
                            setSelectedButtonId(x.id);
                            onConversationClicked(x.id);
                        }}
                        style={{ fontSize: "16px", padding: "10px", margin: "10px", height: "100%" }}
                    >
                        <div className={styles.btnLabel}>
                            <Chat16Filled />
                            &nbsp;&nbsp;
                            {x.topic}
                        </div>
                    </DefaultButton>
                ))}
            </div>
        </>
    );
};
