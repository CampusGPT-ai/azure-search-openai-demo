import { useState } from "react";
import { Checkbox } from "@fluentui/react-components";
import type { CheckboxProps } from "@fluentui/react-components";

import styles from "./Interest.module.css";

interface Props {
    text: string;
    selected: boolean;
}

export const Interest = ({ text, selected }: Props) => {
    const [checked, setChecked] = useState<CheckboxProps["checked"]>(selected);
    return (
        <div className={styles.interestContainer}>
            <Checkbox checked={checked} onChange={(ev, data) => setChecked(data.checked)} label={text} />
        </div>
    );
};
