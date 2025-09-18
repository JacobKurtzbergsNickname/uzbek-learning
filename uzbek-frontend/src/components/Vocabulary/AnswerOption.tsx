"use client";
import { AnswerOptionDTO } from "@/types";
import { JSX, useContext, useMemo, useState } from "react";
import { useEffect } from "react";
import { VocabularyContext } from "./VocabularyContext";

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

    const {correctWord, isAnswerSelected} = useContext(VocabularyContext);
    const [marked, setMarked] = useState("");

    const secondary = useMemo(() => {
        if (isAnswerSelected){
            if (!answer.isSelected && answer.word == correctWord.word) {
                return "!bg-yellow-600";
            }
        }
        return "";
    }, [answer.isSelected, correctWord, isAnswerSelected]);

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
            className={`btn btn-primary ${marked} ${secondary} m-2`}
            onClick={handleClick}>
            {answer.word}
        </button>
    )
}

export {AnswerOption}