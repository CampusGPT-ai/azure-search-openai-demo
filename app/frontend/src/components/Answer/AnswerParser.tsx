import { renderToStaticMarkup } from "react-dom/server";
import { getCitationFilePath, AskResponse } from "../../api";

/***
 * AskResponse = {
    conversation_id: string;
    conversation_topic: string;
    answer: string;
    thoughts: string | null;
    data_points: string[];
    follow_up: string[];
    error?: string;
};

 */

type HtmlParsedAnswer = {
    answerHtml: string;
    citations: string[];
    followupQuestions: string[];
};

export function parseAnswerToHtml(answer: AskResponse, onCitationClicked: (citationFilePath: string) => void): HtmlParsedAnswer {
    const citations: string[] = [];
    const followupQuestions: string[] = answer.follow_up;

    // Extract any follow-up questions that might be in the answer
    //let parsedAnswer = answer.replace(/<<([^>>]+)>>/g, (match, content) => {
    //    followupQuestions.push(content);
    //    return "";
    //});

    // trim any whitespace from the end of the answer after removing follow-up questions
    //parsedAnswer = parsedAnswer.trim();

    const parts = answer.answer.split(/\[([^\]]+)\]/g);

    const fragments: string[] = parts.map((part, index) => {
        if (index % 2 === 0) {
            return part;
        } else {
            let citationIndex: number;
            if (citations.indexOf(part) !== -1) {
                citationIndex = citations.indexOf(part) + 1;
            } else {
                citations.push(part);
                citationIndex = citations.length;
            }

            const path = getCitationFilePath(part);

            return renderToStaticMarkup(
                <a className="supContainer" title={part} onClick={() => onCitationClicked(path)}>
                    <sup>{citationIndex}</sup>
                </a>
            );
        }
    });

    return {
        answerHtml: fragments.join(""),
        citations,
        followupQuestions
    };
}
