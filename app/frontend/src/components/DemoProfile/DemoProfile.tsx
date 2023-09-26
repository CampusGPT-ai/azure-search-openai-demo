import { useState, useEffect } from "react";

import { Image } from "@fluentui/react-components";
import { Subtitle2, Title2 } from "@fluentui/react-components";

import styles from "./DemoProfile.module.css";

interface Props {
    profile: Profile;
    onSelectProfile: (id: string, el: HTMLDivElement) => void;
}

export interface Profile {
    id: string;
    user_id: string;
    full_name: string;
    avatar: string;
    interests: Array<string>;
    demographics: Map<string, string>;
    academics: Map<string, string>;
}

export const DemoProfile = ({ profile: { id, user_id, full_name, avatar, interests, demographics, academics }, onSelectProfile }: Props) => {
    let demoStr: string = "";
    demographics.forEach((value, key, map) => {
        if (demoStr.length > 0) {
            demoStr = demoStr + ", ";
        }
        demoStr = demoStr + key + ": " + value;
    });

    let acadStr: string = "";
    academics.forEach((value, key, map) => {
        if (acadStr.length > 0) {
            acadStr = acadStr + ", ";
        }
        acadStr = key + ": " + value;
    });

    let interestStr: string = "";
    interests.forEach((x, i, arr) => {
        interestStr = interestStr + ", " + x;
    });

    academics.forEach((value, key, map) => {
        acadStr = acadStr + ", " + key + ": " + value;
    });

    return (
        <div
            className={styles.profileContainer}
            onClick={el => {
                el.currentTarget.className = styles.profileContainerSelected;
                onSelectProfile(id, el.currentTarget);
            }}
        >
            <div>
                <Title2>{full_name}</Title2>
            </div>
            <div className={styles.avatarContainer}>
                <Image width={200} height={200} shape="circular" alt={"Photo of " + full_name} src={avatar}></Image>
            </div>
            <div className={styles.infoContainer}>
                <Subtitle2>Academic Profile</Subtitle2>
                <div>{acadStr}</div>
            </div>
            <div className={styles.infoContainer}>
                <Subtitle2>Demographics Information</Subtitle2>
                <div>{demoStr}</div>
            </div>
        </div>
    );
};
