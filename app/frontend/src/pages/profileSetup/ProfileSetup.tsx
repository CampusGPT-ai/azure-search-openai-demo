import { useContext } from "react";
import { DemoProfile } from "../../components/DemoProfile/DemoProfile";
import { demoProfilesApi } from "../../api";
import { InterestsResponse, ProfileModel } from "../../api";
import { useState, useEffect } from "react";
import { Stack, StackItem, IStackTokens } from "@fluentui/react";
import { Button, caption1StrongerClassNames } from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import { UserContext, TopicContext } from "../../contextVariables";

import styles from "./ProfileSetup.module.css";
import profileStyles from "../../components/DemoProfile/DemoProfile.module.css";

const ProfileSetup = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>();
    const [initSelect, setInitSelect] = useState<string>();
    const { selectedProfile, setSelectedProfile } = useContext(UserContext); //switching from state variable to context variable
    const [selectedProfileElement, setSelectedProfileElement] = useState<HTMLDivElement | null>(null);
    const [profiles, setProfiles] = useState<ProfileModel[]>([]);

    const onSelectProfile = (id: string, el: HTMLDivElement) => {
        if (selectedProfileElement != null) selectedProfileElement.className = profileStyles.profileContainer;
        setSelectedProfileElement(el);
        setInitSelect(id);
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

    const handleSubmit = async (event: React.FormEvent) => {
        if (!!initSelect) {
            console.log("submitting login for " + initSelect);
            event.preventDefault();

            const formData = new FormData();
            formData.append("profile_id", initSelect);

            try {
                const response = await fetch("/demo_login", {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                });

                if (response.status != 200) {
                    const responseBody = await response.json();
                    console.error("Form submission error:", responseBody.message);
                } else {
                    console.log("Form submitted successfully");
                    setSelectedProfile(initSelect);
                    navigate("/"); // Navigate to the home route
                }
            } catch (error) {
                console.error("Form submission error:", error);
            }
        }
    };

    useEffect(() => {
        makeDemoProfilesApiRequest();
    }, []);

    return (
        <div className={styles.allProfilesContainer}>
            {isLoading && (
                <p>
                    <br></br>loading...
                </p>
            )}
            {!isLoading && (
                <>
                    <Stack horizontal horizontalAlign="stretch" tokens={stackTokens}>
                        {profiles.map((profile, index) => (
                            <div key={index}>
                                <StackItem className={styles.profileContainer}>
                                    <DemoProfile profile={profile} onSelectProfile={onSelectProfile} onInterestChanged={() => {}}></DemoProfile>
                                </StackItem>
                            </div>
                        ))}
                        ;
                    </Stack>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.loginButtonContainer}>
                            <Button className={styles.loginButton} type="submit" disabled={!initSelect}>
                                LOGIN
                            </Button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default ProfileSetup;
