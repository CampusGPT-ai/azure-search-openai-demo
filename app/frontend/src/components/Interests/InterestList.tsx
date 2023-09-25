import { Interest } from "./Interest";
import { InterestModel } from "../../api";

import styles from "./Interest.module.css";

interface Props {
    list: Array<InterestModel>;
}

export const InterestList = ({ list }: Props) => {
    return (
        <>
            {list.map((x, i) => (
                <Interest text={x.interest} selected={false} />
            ))}
        </>
    );
};
