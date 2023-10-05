import { useState } from "react";
import { Button } from "@fluentui/react-components";
import { makeStyles, shorthands } from "@fluentui/react-components";

import styles from "./Topic.css";

interface Props {
    text: string;
}

const useClasses = makeStyles({
    root: {
        backgroundColor: "#782f40",
        color: "#fff",
        ...shorthands.borderRadius("6px"),
        ...shorthands.border("0"),
        ...shorthands.padding("10px"),
        ...shorthands.margin("10px"),
        fontSize: "16px",

        ":hover": {
            backgroundColor: "#782f40",
            color: "#fff"
        },
        ":active": {
            backgroundImage: "radial-gradient(circle, #270f15 0%, #782f40 100%)",
            color: "#fff"
        },
        ":focus": {
            backgroundColor: "#782f40",
            ...shorthands.borderColor("gray")
        },
        ":disabled": {
            backgroundColor: "gray"
        }
    },
    selected: {
        backgroundImage: "radial-gradient(circle, #270f15 0%, #782f40 100%)",
        color: "#fff",
        ...shorthands.borderRadius("6px"),
        ...shorthands.border("0"),
        ...shorthands.padding("10px"),
        ...shorthands.margin("10px"),
        fontSize: "16px",

        ":hover": {
            backgroundColor: "#782f40",
            color: "#fff"
        },
        ":active": {
            backgroundImage: "radial-gradient(circle, #270f15 0%, #782f40 100%)",
            color: "#fff"
        },
        ":focus": {
            backgroundColor: "#782f40",
            ...shorthands.borderColor("gray")
        },
        ":disabled": {
            backgroundColor: "gray"
        }
    },
    label: {
        fontWeight: "bold",
        textAlign: "left"
    }
});

interface Props {
    text: string;
    onButtonClick: (text: string) => void; // Define a prop for the callback
}

export const Topic = ({ text, onButtonClick }: Props) => {
    const classes = useClasses();

    return (
        <Button
            className={classes.root}
            onClick={() => onButtonClick(text)} // Call the callback with text when clicked
            style={{ fontSize: "16px", color: "#fff" }}
        >
            {text}
        </Button>
    );
};
