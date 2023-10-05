import { Example } from "./Example";

import styles from "./Example.module.css";

export type ExampleModel = {
    text: string;
    value: string;
};

interface Props {
    examples: string[];
    onExampleClicked: (value: string) => void;
}

export const ExampleList = ({ examples, onExampleClicked }: Props) => {
    return (
        <ul className={styles.examplesNavList}>
            {examples.map((x, i) => (
                <li key={i}>
                    <Example text={x} value={x} onClick={onExampleClicked} />
                </li>
            ))}
        </ul>
    );
};
