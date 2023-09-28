import { useState } from "react";

import styles from "./topic.module.css";

import { TextField } from "@fluentui/react";
import { mergeStyles } from "@fluentui/merge-styles";

import "./Topic.module.css"; // Import the CSS file

interface Props {
    text: string;
}

const TopicBox = ({ text }: Props) => (
    <TextField value={text} className="fluent-textbox" underlined>
        {text}
    </TextField>
);

export default TopicBox;
