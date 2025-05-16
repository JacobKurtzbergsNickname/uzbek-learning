import { WordDAO } from "@/types/Word";
import { useContext } from "react";
import { JSX } from "react/jsx-runtime";
import { VocabularyContext } from "./VocabularyContext";
import _ from "lodash";
import { AnswerOption } from "./AnswerOption";
import { AnswerOptionDTO } from "@/types";
import { WordUtils } from "../../utils/word-utilities";

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

    const testableWords = WordUtils
        .composeTestableWords(correctWord, wrongWords)
        .toAnswerOptions()
        .shuffle()

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
            {testableWords.map((w: AnswerOptionDTO, index: number) => {
                return (
                    <AnswerOption 
                        answer={w}
                        index={index}
                        check={check} 
                    />
                )
            })}
        </div>
    )
}