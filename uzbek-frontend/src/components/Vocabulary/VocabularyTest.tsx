import { Word } from "@/types/Word";
import { useContext, useEffect, useState, useMemo } from "react";
import { JSX } from "react/jsx-runtime";
import { VocabularyContext } from "./VocabularyContext";
import _ from "lodash";
import { AnswerOption } from "./AnswerOption";
import { AnswerOptionDTO } from "@/types";
import { WordUtils } from "../../utils/word-utilities";
import { Translation } from "./Translation";

interface VocabTestProps {
    correctWord?: Word;
}

function selectRandomWords(
    words: Word[], 
    correctWord?: Word
): Word[] {
    if (!correctWord) {
        return []
    }
    
    const wrongWords = words.filter((w: Word) => {
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
    const {words, setCorrectWord, setIsAnswerSelected} = useContext(VocabularyContext)
    const [answerOptions, setAnswerOptions] = useState<AnswerOptionDTO[]>([])

    const wrongWords = useMemo(
        () => selectRandomWords(words, correctWord),
        [words, correctWord]
    );

    // Update the correct word in the context when it changes
    useEffect(() => {
        if (correctWord) {
            setCorrectWord(correctWord);
        }
    }, [correctWord, setCorrectWord]);

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
        setIsAnswerSelected(true);
    }

    return (
        <section>
            <Translation>{correctWord.translation}</Translation>
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
        </section>
    )
}