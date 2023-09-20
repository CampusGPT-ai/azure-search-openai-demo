import { InterestList } from "../../components/Interests/InterestList";
import { ChatHistoryMessageModel, ChatHistoryResponse, InterestModel, chatHistoryApi } from "../../api";
import { interestsAllApi } from "../../api";
import { InterestsResponse } from "../../api";
import { useState, useEffect } from "react";

import styles from "./ProfileSetup.module.css";

const ProfileSetup = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const [interests, setInterests] = useState<InterestsResponse | undefined>(undefined);
    const [chatHistory, setChatHistory] = useState<ChatHistoryResponse | undefined>(undefined);

    const makeApiRequest = async () => {
        setIsLoading(true);
        try {
            const result = await interestsAllApi();
            setInterests(result);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const makeHistoryApiRequest = async () => {
        setIsLoading(true);
        try {
            const result = await chatHistoryApi();
            setChatHistory(result);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        makeApiRequest();
        makeHistoryApiRequest();
    }, []);

    let chatHistoryMessages: Array<ChatHistoryMessageModel> = [];
    if (chatHistory?.list) chatHistoryMessages = chatHistory.list;

    return <div className={styles.profileContainer}></div>;
};

export default ProfileSetup;
