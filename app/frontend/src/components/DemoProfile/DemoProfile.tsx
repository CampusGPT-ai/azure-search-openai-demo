import { useState, useEffect } from "react";

import { Image } from "@fluentui/react-components";
import { Subtitle2, Title2 } from "@fluentui/react-components";

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
    demographics: Map<string, string>;
    academics: Map<string, string>;
    courses: Array<string>;
}

interface Props {
    profile: Profile;
    onSelectProfile: (id: string, el: HTMLDivElement) => void;
}

export const DemoProfile = ({ profile: { id, user_id, full_name, avatar, interests, demographics, academics, courses }, onSelectProfile }: Props) => {
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
        interestStr = interestStr + ", " + x;
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
                <Image width={200} height={200} shape="circular" alt={full_name} src={avatars.get(avatar)}></Image>
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
