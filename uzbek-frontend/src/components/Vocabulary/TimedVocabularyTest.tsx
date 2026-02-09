"use client";
import React, { useEffect } from "react";
import { AnswerOption } from "./AnswerOption";
import { Translation } from "./Translation";
import { useTimedQuizMachine } from "./useTimedQuizMachine";
import { Result, Word } from "../../types/Word";

interface TimedVocabularyTestProps {
  words: Word[];
  onComplete: (results: Array<Result>) => void;
}

/**
 * This component manages a timed vocabulary quiz
 * where users select the correct word based on its translation.
 *
 * @param words - Array of Word objects to be used in the quiz.
 * @param onComplete - Callback function that receives the results when the quiz is finished.
 * @returns JSX.Element representing the timed vocabulary test.
 */
function TimedVocabularyTest({ words, onComplete }: TimedVocabularyTestProps) {
  const { state, selectAnswer } = useTimedQuizMachine(words);
  const word = words[state.current];

  // Call onComplete when finished
  useEffect(() => {
    if (state.phase === "finished") {
      onComplete(state.results);
    }
  }, [state.phase, state.results, onComplete]);

  if (state.phase === "finished") {
    return <div>Test finished!</div>;
  }

  return (
    <section>
      <div>Time left: {state.timer}s</div>
      <Translation>{word.translation}</Translation>
      <section className="grid grid-cols-2 gap-1 justify-center items-center w-fit mx-auto mt-8">
        {state.answerOptions.map((w, index) => (
          <AnswerOption
            answer={w}
            key={index}
            index={index}
            check={() => selectAnswer(w.word)}
            isAnswerSelected={state.phase === "showingAnswer"}
            correctWord={word.word}
            selectedWord={state.selected}
          />
        ))}
      </section>
      <div>
        {state.current + 1} / {words.length}
      </div>
    </section>
  );
}

export default TimedVocabularyTest;
