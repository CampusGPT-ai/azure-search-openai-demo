import { Topic } from "./Topic";
import { TopicModel } from "../../api";

import styles from "./topic.module.css";

interface Props {
    list: Array<string>;
}

export const TopicList = ({ list }: Props) => {
    return (
        <>
            {list.map((x, i) => (
                <Topic text={x} />
            ))}
        </>
    );
};
