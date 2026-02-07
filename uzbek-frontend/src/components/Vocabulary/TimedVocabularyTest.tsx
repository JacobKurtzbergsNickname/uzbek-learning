"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AnswerOption } from './AnswerOption';
import { Word } from '../../types/Word';
import { WordUtils } from '../../utils/word-utilities';
import { Translation } from './Translation';
import { AnswerOptionDTO } from '../../types/AnswerOption';

interface TimedVocabularyTestProps {
  words: Word[];
  onComplete: (results: Array<{ word: Word; selected: string | null; correct: boolean }>) => void;
}

const QUESTION_TIME = 5; // seconds

const TimedVocabularyTest: React.FC<TimedVocabularyTestProps> = ({ words, onComplete }) => {
  // Index of the current word/question
  const [current, setCurrent] = useState(0);
  // The word selected by the user (string) or null
  const [selected, setSelected] = useState<string | null>(null);
  // Timer countdown in seconds
  const [timer, setTimer] = useState(QUESTION_TIME);
  // (No need for results state, handle results inline)
  // Ref to store the timer interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Whether an answer has been selected
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);

  // Store answer options in state for selection logic
  const [answerOptions, setAnswerOptions] = useState<AnswerOptionDTO[]>([]);

  // Generate 4 options (1 correct + 3 wrong) and shuffle on question change
  useEffect(() => {
    const correctWord = words[current];
    if (!correctWord) {
      setAnswerOptions([]);
      return;
    }
    const wrongWords = words.filter((w) => w.word !== correctWord.word);
    const shuffledWrong = wrongWords.length > 3
      ? [...wrongWords].sort(() => Math.random() - 0.5).slice(0, 3)
      : wrongWords;
    const options = [correctWord, ...shuffledWrong].map((w) => w.word);
    const testableWords = WordUtils.toAnswerOptions(options).sort(() => Math.random() - 0.5);
    setAnswerOptions(testableWords);
  }, [words, current]);

  // Reset timer and selection when the question changes
  useEffect(() => {
    setTimer(QUESTION_TIME);
    setSelected(null);
    setIsAnswerSelected(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [current]);

  // Advance to the next question or finish the test
  // Store results in a ref to avoid unnecessary re-renders
  const resultsRef = useRef<Array<{ word: Word; selected: string | null; correct: boolean }>>([]);
  const nextQuestion = useCallback((option: string | null) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const word = words[current];
    const correct = option === word.translation;
    resultsRef.current = [...resultsRef.current, { word, selected: option, correct }];
    setIsAnswerSelected(true);
    if (current + 1 >= words.length) {
      onComplete(resultsRef.current);
    } else {
      setTimeout(() => setCurrent(c => c + 1), 800); // short delay for feedback
    }
  }, [current, words, onComplete]);

  // Auto-advance when timer runs out
  // Memoize nextQuestion to avoid exhaustive-deps warning
  const nextQuestionRef = useRef(nextQuestion);
  useEffect(() => { nextQuestionRef.current = nextQuestion; }, [nextQuestion]);
  useEffect(() => {
    if (timer <= 0 && selected === null) {
      nextQuestionRef.current(null);
    }
  }, [timer, selected, nextQuestion]);

  // Helper to update answerOptions with selection
  function selectAnswer(options: AnswerOptionDTO[], answer: AnswerOptionDTO): AnswerOptionDTO[] {
    const index = options.findIndex((w) => w.word === answer.word);
    const selectedAnswer = {
      ...options[index],
      isSelected: true,
    };
    return options.map((w, i) => (i === index ? selectedAnswer : { ...w, isSelected: false }));
  }

  // Handle user answer selection
  const check = (answer: AnswerOptionDTO) => {
    if (selected) return;
    setAnswerOptions(selectAnswer(answerOptions, answer));
    setSelected(answer.word);
    nextQuestion(answer.word);
  };

  // End of test: render nothing or a summary (could be improved)
  if (current >= words.length) return null;

  const word = words[current];

  return (
    <section>
      <div>Time left: {timer}s</div>
      <Translation>{word.translation}</Translation>
      <section className="grid grid-cols-2 gap-1 justify-center items-center w-fit mx-auto mt-8">
        {answerOptions.map((w, index) => (
          <AnswerOption
            answer={w}
            key={index}
            index={index}
            check={check}
            isAnswerSelected={isAnswerSelected}
            correctWord={word.word}
            selectedWord={selected}
          />
        ))}
      </section>
      <div>
        {current + 1} / {words.length}
      </div>
    </section>
  );
};

export default TimedVocabularyTest;
