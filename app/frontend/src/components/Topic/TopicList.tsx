import TopicBox from "./Topic";
import { TopicModel } from "../../api";

import styles from "./topic.module.css";

interface Props {
    list: Array<TopicModel>;
}

export const TopicList = ({ list }: Props) => {
    return (
        <>
            {list.map((x, i) => (
                <TopicBox text={x.topic} />
            ))}
        </>
    );
};
