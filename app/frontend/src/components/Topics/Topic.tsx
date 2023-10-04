import { useState } from "react";
import { Button } from "@fluentui/react-components";
import { makeStyles, shorthands } from "@fluentui/react-components";

import styles from "./Topic.css";

interface Props {
    text: string;
}

const useClasses = makeStyles({
    root: {
        backgroundColor: "transparent",
        color: "#000",
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
        fontSize: "14px"
    },
    label: {
        fontWeight: "bold",
        textAlign: "left"
    }
});

export const Topic = ({ text }: Props) => {
    const [isSelected, setIsSelected] = useState(false);
    const classes = useClasses();

    const toggleSelected = () => {
        setIsSelected(!isSelected);
    };

    return (
        <Button className={isSelected ? classes.root : classes.selected} onClick={toggleSelected}>
            {text}
        </Button>
    );
};
