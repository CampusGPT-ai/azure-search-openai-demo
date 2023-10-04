import { useState, useEffect } from "react";

import { DrawerOverlay, DrawerBody, DrawerHeader, DrawerHeaderTitle } from "@fluentui/react-components/unstable";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { Button } from "@fluentui/react-components";

import styles from "../../pages/chat/Chat.module.css";

interface Props {
    cite: string | undefined; //filepath
    isOpen: boolean;
    onClose: () => void;
}

const CitationDrawer = ({ cite, isOpen, onClose }: Props) => {
    const [isCitationPanelOpen, setIsCitationPanelOpen] = useState(false);

    useEffect(() => {
        setIsCitationPanelOpen(isOpen);
    }, [isOpen]);

    const onDrawerClose = (closed: boolean) => {
        setIsCitationPanelOpen(closed);
        if (!closed) {
            onClose();
        }
    };
    return (
        <div>
            <DrawerOverlay
                className={styles.citationPanelContainer}
                open={isCitationPanelOpen}
                onOpenChange={(_, { open }) => {
                    console.log("citation drawer status change");
                    onDrawerClose(open);
                }}
                size="large"
                position="end"
            >
                <DrawerHeader className={styles.citationPanelHeader}>
                    <DrawerHeaderTitle
                        className={styles.citationPanelHeaderTitle}
                        action={<Button appearance="subtle" aria-label="Close" icon={<Dismiss24Regular />} onClick={() => onDrawerClose(false)} />}
                    >
                        Citation source
                    </DrawerHeaderTitle>
                </DrawerHeader>
                <DrawerBody>
                    <iframe title="Citation" src={cite} width="100%" height="810px" />
                </DrawerBody>
            </DrawerOverlay>
        </div>
    );
};

export default CitationDrawer;
