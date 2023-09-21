import { InterestList } from "../../components/Interests/InterestList";
import { interestsAllApi } from "../../api";
import { InterestsResponse } from "../../api";
import { useState, useEffect } from "react";

import styles from "./ProfileSetup.module.css";

const ProfileSetup = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const [interests, setInterests] = useState<InterestsResponse | undefined>(undefined);

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

    useEffect(() => {
        makeApiRequest();
    }, []);

    return <div className={styles.profileContainer}></div>;
};

export default ProfileSetup;
