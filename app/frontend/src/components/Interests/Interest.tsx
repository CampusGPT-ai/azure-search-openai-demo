import { useState } from "react";
import { Checkbox } from "@fluentui/react-components";
import { makeStyles } from "@fluentui/react-components";
import type { CheckboxProps } from "@fluentui/react-components";

import styles from "./Interest.css";

interface Props {
    text: string;
    selected: boolean;
}

const useClasses = makeStyles({
    checkboxes: {
        color: "#000"
    }
});

export const Interest = ({ text, selected }: Props) => {
    const [checked, setChecked] = useState<CheckboxProps["checked"]>(selected);
    const classes = useClasses();
    return <Checkbox className={classes.checkboxes} onChange={(ev, data) => setChecked(data.checked)} label={text} />;
};
