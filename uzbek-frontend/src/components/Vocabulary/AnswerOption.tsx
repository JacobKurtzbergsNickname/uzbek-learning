import { AnswerOptionDTO } from "@/types";
import { JSX } from "react";

interface AnswerOptionProps {
    answer: AnswerOptionDTO;
    index: number;
    check: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

function AnswerOption({answer, index, check }: AnswerOptionProps): JSX.Element {
    return (
        <button 
            key={index} 
            className={`btn btn-primary !bg-red-600 m-2`}
            onClick={check}>
            {answer.word}
        </button>
    )
}

export {AnswerOption}