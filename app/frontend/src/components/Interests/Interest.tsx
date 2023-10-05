import { useState } from "react";
import { InterestModel } from "../../api";
import { Checkbox, CheckboxOnChangeData, makeStyles, CheckboxProps } from "@fluentui/react-components";

import styles from "./Interest.css";

interface Props {
    text: string;
    selected: boolean;
    onCheckChange: (interest: InterestModel) => void;
}

const useClasses = makeStyles({
    checkboxes: {
        color: "#000"
    }
});

export const Interest = ({ text, selected, onCheckChange }: Props) => {
    const classes = useClasses();

    const handleCheckChange = (ev: React.ChangeEvent<HTMLInputElement>, data: CheckboxOnChangeData) => {
        //console.log("handling check change for: " + text + ". Setting check to " + data.checked.toString());
        const isSelected = data.checked === true; // Set to false for 'mixed' or undefined
        onCheckChange({ interest: text, selected: isSelected });
    };

    return <Checkbox className={classes.checkboxes} onChange={handleCheckChange} label={text} />;
};
