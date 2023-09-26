import { DemoProfile } from "../../components/DemoProfile/DemoProfile";
import { Profile } from "../../components/DemoProfile/DemoProfile";
import { interestsAllApi } from "../../api";
import { InterestsResponse } from "../../api";
import { useState, useEffect } from "react";
import { Stack, StackItem, IStackTokens } from "@fluentui/react";
import { Button } from "@fluentui/react-components";

import styles from "./ProfileSetup.module.css";
import profileStyles from "../../components/DemoProfile/DemoProfile.module.css";
import dylanAvatar from "../../assets/avatars/dylan.png";
import jamalAvatar from "../../assets/avatars/jamal.png";
import tiffanyAvatar from "../../assets/avatars/tiffany.png";

const ProfileSetup = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const [interests, setInterests] = useState<InterestsResponse | undefined>(undefined);
    const [selectedProfileElement, setSelectedProfileElement] = useState<HTMLDivElement | null>(null);
    const [selectedProfileId, setSelectedProfileId] = useState<string>("");

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

    const onSelectProfile = (id: string, el: HTMLDivElement) => {
        if (selectedProfileElement != null) selectedProfileElement.className = profileStyles.profileContainer;
        setSelectedProfileElement(el);
        setSelectedProfileId(id);
    };

    const stackTokens: IStackTokens = {
        padding: 10,
        childrenGap: 5
    };

    const profiles: Array<Profile> = [
        {
            id: "1",
            user_id: "jjacksonvill",
            full_name: "Jamal Jacksonville",
            avatar: jamalAvatar,
            interests: ["team sports", "mental health"],
            demographics: new Map([
                ["Ethnicity", "African American"],
                ["Gender", "Male"]
            ]),
            academics: new Map([
                ["Academic Year", "3"],
                ["Major", "English"],
                ["Minor", "History"]
            ])
        },
        {
            id: "2",
            user_id: "ttalahassee",
            full_name: "Tiffany Talahassee",
            avatar: tiffanyAvatar,
            interests: ["languages", "outdoor activities", "watersports", "peforming arts"],
            demographics: new Map([
                ["Ethnicity", "White"],
                ["Gender", "Female"]
            ]),
            academics: new Map([
                ["Academic Year", "2"],
                ["Major", "Physics"],
                ["Minor", "Mathematics"]
            ])
        },
        {
            id: "3",
            user_id: "ddaytona",
            full_name: "Dylan Daytona",
            avatar: dylanAvatar,
            interests: ["languages", "outdoor activities", "watersports", "peforming arts"],
            demographics: new Map([
                ["Ethnicity", "White"],
                ["Gender", "Male"]
            ]),
            academics: new Map([
                ["Academic Year", "2"],
                ["Major", "Physics"],
                ["Minor", "Mathematics"]
            ])
        }
    ];

    return (
        <div className={styles.allProfilesContainer}>
            <Stack horizontal horizontalAlign="stretch" tokens={stackTokens}>
                <StackItem className={styles.profileContainer}>
                    <DemoProfile profile={profiles[0]} onSelectProfile={onSelectProfile}></DemoProfile>
                </StackItem>
                <StackItem className={styles.profileContainer}>
                    <DemoProfile profile={profiles[1]} onSelectProfile={onSelectProfile}></DemoProfile>
                </StackItem>
                <StackItem className={styles.profileContainer}>
                    <DemoProfile profile={profiles[2]} onSelectProfile={onSelectProfile}></DemoProfile>
                </StackItem>
            </Stack>
            <div className={styles.loginButtonContainer}>
                <Button
                    onClick={el => {
                        console.log("logging in with profile id: " + selectedProfileId);
                    }}
                >
                    Login as the selected user
                </Button>
            </div>
        </div>
    );
};

export default ProfileSetup;
