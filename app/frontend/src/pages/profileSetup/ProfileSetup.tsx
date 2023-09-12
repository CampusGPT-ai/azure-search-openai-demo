import { InterestList } from "../../components/Interests/InterestList";
import { InterestModel } from "../../api";
import { interestsAllApi } from "../../api";
import { InterestsResponse } from "../../api";
import { useState, useEffect } from "react";

import styles from "./ProfileSetup.module.css";

const INTERESTS: InterestModel[] = [
    { interest: "Team Sports", isApplicable: false },
    { interest: "Outdoor activities", isApplicable: false },
    { interest: "Languages", isApplicable: false },
    { interest: "Travel", isApplicable: false },
    { interest: "Books/Reading", isApplicable: false },
    { interest: "Science", isApplicable: false },
    { interest: "Health & Wellness", isApplicable: false },
    { interest: "Photography", isApplicable: false },
    { interest: "Gaming", isApplicable: false }
];

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

    let list: Array<InterestModel> = [];
    if (interests?.list) list = interests.list;

    return (
        <div className={styles.profileContainer}>
            <h2 className={styles.profileTitle}>Tell us about your interests</h2>
            <InterestList list={list} />
        </div>
    );
};

export default ProfileSetup;

//#Component.displayName = "ProfileSetup";
