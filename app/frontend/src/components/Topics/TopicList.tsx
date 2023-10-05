import { Topic } from "./Topic";
import { TopicModel } from "../../api";

import styles from "./topic.module.css";
interface Props {
    list: Array<string>;
    onTopicClick: (text: string) => void;
}

export const TopicList = ({ list, onTopicClick }: Props) => {
    return (
        <>
            {list.map((x, i) => (
                <Topic text={x} onButtonClick={onTopicClick} key={i} />
            ))}
        </>
    );
};
