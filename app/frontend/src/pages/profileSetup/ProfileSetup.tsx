import { DemoProfile } from "../../components/DemoProfile/DemoProfile";
import { demoProfilesApi, interestsAllApi } from "../../api";
import { InterestsResponse, ProfileModel } from "../../api";
import { useState, useEffect } from "react";
import { Stack, StackItem, IStackTokens } from "@fluentui/react";
import { Button } from "@fluentui/react-components";

import styles from "./ProfileSetup.module.css";
import profileStyles from "../../components/DemoProfile/DemoProfile.module.css";

const ProfileSetup = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>();

    const [interests, setInterests] = useState<InterestsResponse | undefined>(undefined);
    const [selectedProfileElement, setSelectedProfileElement] = useState<HTMLDivElement | null>(null);
    const [selectedProfileId, setSelectedProfileId] = useState<string>("");
    const [profiles, setProfiles] = useState<ProfileModel[]>([]);

    const onSelectProfile = (id: string, el: HTMLDivElement) => {
        if (selectedProfileElement != null) selectedProfileElement.className = profileStyles.profileContainer;
        setSelectedProfileElement(el);
        setSelectedProfileId(id);
    };

    const stackTokens: IStackTokens = {
        padding: 10,
        childrenGap: 5
    };

    const makeDemoProfilesApiRequest = async () => {
        //console.log("making demo profiles api request");
        setIsLoading(true);
        try {
            const result = await demoProfilesApi();
            setProfiles(result.profiles);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        makeDemoProfilesApiRequest();
    }, []);

    return (
        <div className={styles.allProfilesContainer}>
            {isLoading && <p>loading...</p>}
            {!isLoading && (
                <>
                    <Stack horizontal horizontalAlign="stretch" tokens={stackTokens}>
                        {profiles.map((profile, index) => (
                            <div key={index}>
                                <StackItem className={styles.profileContainer}>
                                    <DemoProfile profile={profile} onSelectProfile={onSelectProfile}></DemoProfile>
                                </StackItem>
                            </div>
                        ))}
                        ;
                    </Stack>
                    <form action="/demo_login" method="POST">
                        <div className={styles.loginButtonContainer}>
                            <Button
                                className={styles.loginButton}
                                type="submit"
                                onClick={el => {
                                    //console.log("logging in with profile id: " + selectedProfileId);
                                }}
                            >
                                LOGIN
                            </Button>
                            <input type="hidden" name="profile_id" value={selectedProfileId} />
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default ProfileSetup;
