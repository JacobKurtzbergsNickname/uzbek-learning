"use client";
import { AnswerOptionDTO } from "@/types";
import { JSX } from "react";

interface AnswerOptionProps {
    answer: AnswerOptionDTO;
    index: number;
    check: (answer: AnswerOptionDTO) => void;
    isAnswerSelected?: boolean;
    correctWord?: string;
    selectedWord?: string | null;
}

function assignMarkup(answer: AnswerOptionDTO, isAnswerSelected?: boolean, correctWord?: string, selectedWord?: string | null): string {
        if (!isAnswerSelected) return "";
        // Green: selected and correct
        if (answer.isSelected && answer.isCorrect) return "!bg-green-600";
        // Red: selected and wrong
        if (answer.isSelected && !answer.isCorrect) return "!bg-red-600";
        // Yellow: correct answer, if a wrong answer was selected or if no answer was selected (timeout)
        if (
            !answer.isSelected &&
            answer.word === correctWord &&
            ((selectedWord && selectedWord !== correctWord) || selectedWord === null)
        ) return "!bg-yellow-600";
        return "";
}

function AnswerOption({answer, index, check, isAnswerSelected, correctWord, selectedWord }: AnswerOptionProps): JSX.Element {

    const marked = assignMarkup(answer, isAnswerSelected, correctWord, selectedWord);
    if (!answer) {
        return <div>No answer available</div>;
    }
    function handleClick() {
        check(answer);
    }
    return (
        <button 
            key={index} 
            className={`
                btn btn-primary
                transition-all duration-150 ease-in-out
                w-60 h-60 text-xl shadow-md flex items-center justify-center
                ${marked} m-2`
            }
            onClick={handleClick}>
            {answer.word}
        </button>
    )
}

export {AnswerOption}