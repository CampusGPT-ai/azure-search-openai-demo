import { Interest } from "./Interest";
import { InterestModel } from "../../api";

import styles from "./Interest.module.css";

const INTERESTS: InterestModel[] = [
    { interest: "Team Sports", isApplicable: false },
    { interest: "Outdoor activities", isApplicable: false },
    { interest: "Languages", isApplicable: false },
    { interest: "Travel", isApplicable: false },
    { interest: "Books/Reading", isApplicable: false },
    { interest: "Science", isApplicable: false },
    { interest: "Health & Wellness", isApplicable: false },
    { interest: "Photography", isApplicable: false },
    { interest: "Gaming", isApplicable: false }
];

export const InterestList = () => {
    return (
        <div className={styles.interestList}>
            {INTERESTS.map((x, i) => (
                <Interest text={x.interest} selected={x.isApplicable} />
            ))}
        </div>
    );
};
