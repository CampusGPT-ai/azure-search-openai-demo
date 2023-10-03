import { useState } from "react";
import { Button } from "@fluentui/react-components";
import { makeStyles } from "@fluentui/react-components";

import styles from "./Topic.css";

interface Props {
    text: string;
}

const useClasses = makeStyles({
    buttonStyle: {
        color: "#000"
        // Add any other styling needed for the button
    },
    selectedButtonStyle: {
        color: "#FFF",
        backgroundColor: "#0078D4" // Example selected color
        // Add any other styling for a selected button
    }
});

export const Topic = ({ text }: Props) => {
    const [isSelected, setIsSelected] = useState(false);
    const classes = useClasses();

    const toggleSelected = () => {
        setIsSelected(!isSelected);
    };

    return (
        <Button className={isSelected ? classes.selectedButtonStyle : classes.buttonStyle} onClick={toggleSelected}>
            {text}
        </Button>
    );
};
