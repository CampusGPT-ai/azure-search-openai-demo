import { useState, useEffect } from "react";

import { Image, Button } from "@fluentui/react-components";
import { Subtitle1, Title3 } from "@fluentui/react-components";
import { ProfileModel, InterestModel } from "../../api";
import { InterestList } from "../Interests/InterestList";
import { Stack, StackItem } from "@fluentui/react";
import { Separator } from "@fluentui/react";
import { NavLink } from "react-router-dom";

import styles from "./ProfilePopover.module.css";

// TODO: avatar handling for demo only, needs to move to proper static asset handling
import dylan from "../../assets/avatars/dylan.png";
import jamal from "../../assets/avatars/jamal.png";
import tiffany from "../../assets/avatars/tiffany.png";

const avatars: Map<string, string> = new Map();
avatars.set("dylan", dylan);
avatars.set("jamal", jamal);
avatars.set("tiffany", tiffany);
// end temp avatar handling

interface Props {
    profile: ProfileModel;
    interestList: InterestModel[];
    onInterestChanged: (interests: InterestModel) => void;
    onLogout: () => void;
}

export const ProfilePopover = ({
    profile: { id, user_id, full_name, avatar, interests, demographics, academics, courses },
    interestList,
    onInterestChanged,
    onLogout
}: Props) => {
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

    let courseStr: string = "";
    courses.forEach((x, i, arr) => {
        if (courseStr.length > 0) {
            courseStr = courseStr + ", ";
        }
        courseStr = courseStr + x;
    });

    // let interestList: Array<InterestModel> = [];
    // if (interests) interestList = interests.map((x, i, arr) => ({ interest: x, selected: false }));

    return (
        <Stack className={styles.profileContainer}>
            <StackItem>
                <h2 style={{ display: "inline", verticalAlign: "bottom" }}>My Profile Settings</h2>
                <NavLink to="/profile">
                    <Button
                        style={{ marginLeft: "40px", float: "right" }}
                        onClick={el => {
                            onLogout();
                        }}
                    >
                        Logout
                    </Button>
                </NavLink>
                <Separator style={{ marginBottom: "10px" }} />
            </StackItem>
            <StackItem>
                <div>
                    <h3 style={{ marginBottom: "3px" }}>My Completed Courses</h3>
                </div>
                <div className={styles.coursesGrid}>
                    {courses.map((c, i, arr) => (
                        <div className={styles.coursePill}>{c}</div>
                    ))}
                </div>
            </StackItem>
            <StackItem>
                <div style={{ marginTop: "24px" }}>
                    <h3 style={{ marginBottom: "3px" }}>My Interests</h3>
                </div>
                <InterestList list={interestList} onInterestChanged={onInterestChanged} />
            </StackItem>
        </Stack>
    );
};
