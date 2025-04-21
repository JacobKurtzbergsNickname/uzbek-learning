import { WordDAO } from "@/types/Word";
import { useContext } from "react";
import { JSX } from "react/jsx-runtime";
import { VocabularyContext } from "./VocabularyContext";
import _ from "lodash";

interface VocabTestProps {
    correctWord?: WordDAO;
}

type ClickEvent = React.MouseEvent<HTMLButtonElement, MouseEvent>

export function VocabularyTest( {correctWord} :VocabTestProps):JSX.Element {
    const {words} = useContext(VocabularyContext)

    if (!correctWord) {
        return <div>No word selected</div>;
    }

    const wrongWords = _.sampleSize(
        words.filter((w: WordDAO) => w.word !== correctWord.word), 
        2
    )

    const testableWords = [
        correctWord.word, 
        ...wrongWords.map((w: WordDAO) => w.word)
    ];

    const check = (e: ClickEvent) => {
        console.log()
        const selectedWord = e.currentTarget.innerText
        if (selectedWord === correctWord.word) {
            alert("Correct!")
        }
        else {
            alert("Wrong!")
        }
    }

    return (
        <div>
            <p style={{justifySelf: "center"}}>{correctWord.translation}</p>
            {testableWords.map((w: string, index: number) => {
                return (
                    <button 
                        key={index} 
                        className="btn btn-primary m-2" 
                        onClick={(w) => check(w)}>
                        {w}
                    </button>
                )
            })}
        </div>
    )
}