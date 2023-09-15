import { Example } from "./Example";

import styles from "./Example.module.css";

export type ExampleModel = {
    text: string;
    value: string;
};

const EXAMPLES: ExampleModel[] = [
    {
        text: "How can I get help picking courses for next semester?",
        value: "How can I get help picking courses for next semester?"
    },
    {
        text: "Who are the adivors for physics?",
        value: "Who are the adivors for physics?"
    },
    {
        text: "How can I get help with financial aid?",
        value: "How can I get help with financial aid?"
    }
];

interface Props {
    onExampleClicked: (value: string) => void;
}

export const ExampleList = ({ onExampleClicked }: Props) => {
    return (
        <ul className={styles.examplesNavList}>
            {EXAMPLES.map((x, i) => (
                <li key={i}>
                    <Example text={x.text} value={x.value} onClick={onExampleClicked} />
                </li>
            ))}
        </ul>
    );
};
