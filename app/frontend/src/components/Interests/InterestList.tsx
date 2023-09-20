import { Interest } from "./Interest";
import { InterestModel } from "../../api";

import styles from "./Interest.module.css";

interface Props {
    list: Array<InterestModel>;
}

export const InterestList = ({ list }: Props) => {
    return (
        <div className={styles.interestList}>
            {list.map((x, i) => (
                <Interest text={x.interest} selected={false} />
            ))}
        </div>
    );
};
