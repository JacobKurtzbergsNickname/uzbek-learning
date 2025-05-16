import { WordDAO } from "@/types/Word";
import { useContext, useEffect, useState, useMemo } from "react";
import { JSX } from "react/jsx-runtime";
import { VocabularyContext } from "./VocabularyContext";
import _ from "lodash";
import { AnswerOption } from "./AnswerOption";
import { AnswerOptionDTO } from "@/types";
import { WordUtils } from "../../utils/word-utilities";

interface VocabTestProps {
    correctWord?: WordDAO;
}

function selectRandomWords(
    words: WordDAO[], 
    correctWord?: WordDAO
): WordDAO[] {
    if (!correctWord) {
        return []
    }
    
    const wrongWords = words.filter((w: WordDAO) => {
        return w.word !== correctWord?.word
    })
    return _.sampleSize(wrongWords, 3)
}

function selectAnswer(
    answerOptions: AnswerOptionDTO[], 
    answer: AnswerOptionDTO
): AnswerOptionDTO[] {
    const index = answerOptions
                    .findIndex(
                        (w: AnswerOptionDTO) => w.word === answer.word)
    const selectedAnswer = {
        ...answerOptions[index],
        isSelected: true,
    }


    return answerOptions.map((w: AnswerOptionDTO, i: number) => {
        if (i === index) {
            return selectedAnswer
        }
        return {
            ...w,
            isSelected: false,
        }
    })
}

/**
 * VocabularyTest component
 * @param {VocabTestProps} props - The props for the component
 * @returns {JSX.Element} - The rendered component
 */

export function VocabularyTest( {correctWord} :VocabTestProps):JSX.Element {
    const {words} = useContext(VocabularyContext)
    const [answerOptions, setAnswerOptions] = useState<AnswerOptionDTO[]>([])

    const wrongWords = useMemo(
        () => selectRandomWords(words, correctWord),
        [words, correctWord]
    );

    useEffect(() => {
        let testableWords: AnswerOptionDTO[] = []
        if (correctWord) {
            testableWords = WordUtils
                .composeTestableWords(correctWord, wrongWords)
                .toAnswerOptions()
                .shuffle();
        }
        setAnswerOptions(testableWords)
    }, [correctWord, wrongWords, setAnswerOptions]);

     if (!correctWord) {
        return <div>No word selected</div>;
    }

    const check = (answer: AnswerOptionDTO) => {
        setAnswerOptions(selectAnswer(answerOptions, answer))
    }

    return (
        <div>
            <p style={{justifySelf: "center"}}>{correctWord.translation}</p>
            {answerOptions.map((w: AnswerOptionDTO, index: number) => {
                return (
                    <AnswerOption 
                        answer={w}
                        key={index}
                        index={index}
                        check={check} 
                    />
                )
            })}
        </div>
    )
}