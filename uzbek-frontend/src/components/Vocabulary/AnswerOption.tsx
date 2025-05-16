import { AnswerOptionDTO } from "@/types";
import { JSX, useState } from "react";
import { useEffect } from "react";

interface AnswerOptionProps {
    answer: AnswerOptionDTO;
    index: number;
    check: (answer: AnswerOptionDTO) => void;
}

function assignMarkup(answer: AnswerOptionDTO): string {

    if (!answer.isSelected) {
        return "";
    } 

    return answer.isCorrect ? "!bg-green-600" : "!bg-red-600";

}

function AnswerOption({answer, index, check }: AnswerOptionProps): JSX.Element {

    const [marked, setMarked] = useState("");

    useEffect(() => {
        console.groupCollapsed(`[AnswerOption] Rendered at index: ${index}`);
        console.table(answer);
        console.groupEnd();
    }, [answer, index]);

    useEffect(() => {
        setMarked(assignMarkup(answer));
    }, [answer]);

    if (!answer) {
        return <div>No answer available</div>;
    }

    function handleClick() {
        check(answer);
    }

    return (
        <button 
            key={index} 
            className={`btn btn-primary ${marked}`}
            onClick={handleClick}>
            {answer.word}
        </button>
    )
}

export {AnswerOption}