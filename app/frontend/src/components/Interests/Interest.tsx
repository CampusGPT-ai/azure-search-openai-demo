import { useState } from "react";
import { InterestModel } from "../../api";
import { Checkbox, CheckboxOnChangeData, makeStyles, CheckboxProps } from "@fluentui/react-components";

import styles from "./Interest.module.css";

interface Props {
    text: string;
    selected: boolean;
    onCheckChange: (interest: InterestModel) => void;
}

export const Interest = ({ text, selected, onCheckChange }: Props) => {
    const handleCheckChange = (ev: React.ChangeEvent<HTMLInputElement>, data: CheckboxOnChangeData) => {
        //console.log("handling check change for: " + text + ". Setting check to " + data.checked.toString());
        const isSelected = data.checked === true; // Set to false for 'mixed' or undefined
        onCheckChange({ interest: text, selected: isSelected });
    };

    return (
        <div className={styles.interestPill}>
            <Checkbox shape="circular" className={styles.interest} onChange={handleCheckChange} label={text} />
        </div>
    );
};
