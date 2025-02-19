import { useState, useEffect } from "react";

import { Image } from "@fluentui/react-components";
import { Subtitle2, Title2 } from "@fluentui/react-components";
import { ProfileModel, InterestModel } from "../../api";
import { InterestList } from "../Interests/InterestList";

import styles from "./DemoProfile.module.css";

// TODO: avatar handling for demo only, needs to move to proper static asset handling
import dylan from "../../assets/avatars/dylan.png";
import jamal from "../../assets/avatars/jamal.png";
import tiffany from "../../assets/avatars/tiffany.png";

const avatars: Map<string, string> = new Map();
avatars.set("dylan", dylan);
avatars.set("jamal", jamal);
avatars.set("tiffany", tiffany);
// end temp avatar handling

export interface Profile {
    id: string;
    user_id: string;
    full_name: string;
    avatar: string;
    interests: Array<string>;
    demographics: {
        Ethnicity: string;
        Gender: string;
    };
    academics: {
        "Academic Year": string;
        Major: string;
        Minor: string;
    };
    courses: Array<string>;
}

interface Props {
    profile: ProfileModel;
    isMe?: boolean;
    onSelectProfile: (id: string, el: HTMLDivElement) => void;
    onInterestChanged: (interests: InterestModel) => void;
}

export const DemoProfile = ({
    profile: { id, user_id, full_name, avatar, interests, demographics, academics, courses },
    isMe,
    onSelectProfile,
    onInterestChanged
}: Props) => {
    let isMeViewing: boolean = isMe == true;
    let demoStr: string = "";
    let demo_keys = Object.keys(demographics);
    let demo_values = Object.values(demographics);

    for (let i = 0; i < demo_keys.length; i++) {
        if (demoStr.length > 0) {
            demoStr = demoStr + ", ";
        }
        let capKey = demo_keys[i].charAt(0).toUpperCase() + demo_keys[i].slice(1);
        demoStr = demoStr + capKey + ": " + demo_values[i];
    }

    let acadStr: string = "";
    let acad_keys = Object.keys(academics);
    let acad_values = Object.values(academics);
    for (let i = 0; i < acad_keys.length; i++) {
        if (acadStr.length > 0) {
            acadStr = acadStr + ", ";
        }
        let capKey = acad_keys[i].charAt(0).toUpperCase() + acad_keys[i].slice(1);
        acadStr = acadStr + capKey + ": " + acad_values[i];
    }

    let interestStr: string = "";
    interests.forEach((x, i, arr) => {
        if (interestStr.length > 0) {
            interestStr = interestStr + ", ";
        }
        interestStr = interestStr + x;
    });

    let interestList: Array<InterestModel> = [];
    if (interests) interestList = interests.map((x, i, arr) => ({ interest: x, selected: false }));

    return (
        <div
            className={styles.profileContainer}
            onClick={el => {
                if (!isMeViewing) el.currentTarget.className = styles.profileContainerSelected;
                onSelectProfile(id, el.currentTarget);
            }}
        >
            <div>
                <Title2>{full_name}</Title2>
            </div>
            <div className={styles.avatarContainer}>
                <Image width={200} height={200} shape="circular" alt={full_name} src={avatars.get(avatar)}></Image>
            </div>
            {!isMeViewing && (
                <div className={styles.infoContainer}>
                    <Subtitle2>Academic Profile</Subtitle2>
                    <div>{acadStr}</div>
                </div>
            )}
            {!isMeViewing && (
                <div className={styles.infoContainer}>
                    <Subtitle2>Demographics Information</Subtitle2>
                    <div>{demoStr}</div>
                </div>
            )}
            {!isMeViewing && (
                <div className={styles.infoContainer}>
                    <Subtitle2>Interests</Subtitle2>
                    <div>{interestStr}</div>
                </div>
            )}
        </div>
    );
};
