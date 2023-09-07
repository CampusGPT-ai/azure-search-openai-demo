import { InterestList } from "../../components/Interests/InterestList";

import styles from "./ProfileSetup.module.css";

export function Component(): JSX.Element {
    return (
        <div className={styles.profileContainer}>
            <h2 className={styles.profileTitle}>Tell us about your interests</h2>
            <InterestList />
        </div>
    );
}

Component.displayName = "ProfileSetup";
