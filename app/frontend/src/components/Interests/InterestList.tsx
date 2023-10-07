import { Interest } from "./Interest";
import { InterestModel } from "../../api";

import styles from "./Interest.module.css";

interface Props {
    list: Array<InterestModel>;
    onInterestChanged: (interests: InterestModel) => void;
}

export const InterestList = ({ list, onInterestChanged }: Props) => {
    const loggedOnInterestChanged = (interest: InterestModel) => {
        //console.log("onInterestChanged accessed with argument:", interest);
        onInterestChanged(interest);
    };

    return (
        <div className={styles.interestList}>
            {list.map((x, i) => (
                <Interest text={x.interest} selected={false} onCheckChange={loggedOnInterestChanged} />
            ))}
        </div>
    );
};
