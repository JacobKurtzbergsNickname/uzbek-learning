import { useReducer, useEffect, useRef } from "react";
import { Word } from "../../types/Word";
import { AnswerOptionDTO } from "../../types/AnswerOption";
import { WordUtils } from "../../utils/word-utilities";

// --- Types ---
/**
 * Phase of the quiz machine, representing the current step in the quiz flow.
 * - 'question': User is answering the question.
 * - 'showingAnswer': Correct answer is shown after user input or timeout.
 * - 'finished': Quiz is complete.
 */
type Phase = "question" | "showingAnswer" | "finished";

/**
 * State structure for the quiz machine.
 * @property current - Index of the current question.
 * @property phase - Current phase of the quiz.
 * @property timer - Seconds left for the current question.
 * @property selected - User's selected answer (word), or null.
 * @property answerOptions - Current answer options for the question.
 * @property results - Array of results for each question.
 */
interface QuizState {
  current: number;
  phase: Phase;
  timer: number;
  selected: string | null;
  answerOptions: AnswerOptionDTO[];
  results: Array<{ word: Word; selected: string | null; correct: boolean }>;
}

/**
 * Actions for quiz state management.
 * @property type - Action type for state transition.
 * @property answer - User's selected answer (for SELECT_ANSWER).
 */
type QuizAction =
  | { type: "START_QUESTION" }
  | { type: "TICK" }
  | { type: "SELECT_ANSWER"; answer: string }
  | { type: "TIMEOUT" }
  | { type: "SHOW_ANSWER" }
  | { type: "NEXT_QUESTION" }
  | { type: "FINISH" };

// --- Helpers ---
/**
 * Generates answer options for the current question.
 * @param words - Array of all quiz words.
 * @param current - Index of the current question.
 * @returns Array of answer options for the question.
 */
function generateOptions(words: Word[], current: number): AnswerOptionDTO[] {
  return WordUtils.generateTestOptions(words, current);
}

/**
 * Marks answer options as correct/incorrect/selected based on user input or timeout.
 * @param options - Array of answer options.
 * @param correctWord - The correct answer word.
 * @param selected - User's selected answer, or null for timeout.
 * @returns Array of answer options with marking applied.
 */
function markAnswers(
  options: AnswerOptionDTO[],
  correctWord: string,
  selected: string | null
): AnswerOptionDTO[] {
  return options.map((opt) => {
    if (selected === null) {
      // Timeout: highlight correct
      return {
        ...opt,
        isSelected: false,
        isCorrect: opt.word === correctWord,
      };
    }
    if (opt.word === selected) {
      return {
        ...opt,
        isSelected: true,
        isCorrect: opt.word === correctWord,
      };
    }
    if (opt.word === correctWord) {
      return {
        ...opt,
        isSelected: false,
        isCorrect: true,
      };
    }
    return { ...opt, isSelected: false, isCorrect: false };
  });
}

// --- Reducer ---
/**
 * Reducer function for quiz state transitions.
 * Handles all quiz logic and state changes based on actions.
 * @param state - Current quiz state.
 * @param action - Action to transition state.
 * @returns New quiz state after transition.
 */
function quizReducer(state: QuizState, action: QuizAction & { words: Word[] }): QuizState {
  const { words } = action;
  const word = words[state.current];
  switch (action.type) {
    case "START_QUESTION":
      return {
        ...state,
        phase: "question",
        timer: 5,
        selected: null,
        answerOptions: generateOptions(words, state.current),
      };
    case "TICK":
      if (state.phase !== "question") return state;
      if (state.timer <= 1 && state.selected === null) {
        // Timeout
        return {
          ...state,
          phase: "showingAnswer",
          answerOptions: markAnswers(state.answerOptions, word.word, null),
          results: [...state.results, { word, selected: null, correct: false }],
        };
      }
      return { ...state, timer: state.timer - 1 };
    case "SELECT_ANSWER":
      if (state.phase !== "question") return state;
      const correct = action.answer === word.translation;
      return {
        ...state,
        phase: "showingAnswer",
        selected: action.answer,
        answerOptions: markAnswers(state.answerOptions, word.word, action.answer),
        results: [...state.results, { word, selected: action.answer, correct }],
      };
    case "SHOW_ANSWER":
      return { ...state, phase: "showingAnswer" };
    case "NEXT_QUESTION":
      if (state.current + 1 >= words.length) {
        return { ...state, phase: "finished" };
      }
      return {
        ...state,
        current: state.current + 1,
        phase: "question",
        timer: 5,
        selected: null,
        answerOptions: generateOptions(words, state.current + 1),
      };
    case "FINISH":
      return { ...state, phase: "finished" };
    default:
      return state;
  }
}

// --- Custom Hook ---
/**
 * Custom hook for timed quiz state machine.
 * Encapsulates reducer, orchestrating effect, and action dispatchers.
 * @param words - Array of quiz words.
 * @returns Quiz state, answer selection dispatcher, and restart dispatcher.
 */
export function useTimedQuizMachine(words: Word[]) {
  const initialState: QuizState = {
    current: 0,
    phase: "question",
    timer: 5,
    selected: null,
    answerOptions: generateOptions(words, 0),
    results: [],
  };
  const [state, dispatch] = useReducer((s, a) => quizReducer(s, { ...a, words }), initialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Orchestrate timer and phase transitions
  useEffect(() => {
    switch (state.phase) {
      case "question":
        timerRef.current = setInterval(() => {
          dispatch({ type: "TICK" });
        }, 1000);
        break;
      case "showingAnswer":
        if (timerRef.current) clearInterval(timerRef.current);
        const linger = setTimeout(() => {
          dispatch({ type: "NEXT_QUESTION" });
        }, 800);
        return () => clearTimeout(linger);
      case "finished":
        if (timerRef.current) clearInterval(timerRef.current);
        break;
      default:
        break;
    }
    // Cleanup for timer interval
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.phase]);

  // Action dispatchers
  const selectAnswer = (answer: string) => dispatch({ type: "SELECT_ANSWER", answer });
  const restart = () => dispatch({ type: "START_QUESTION" });

  return {
    state,
    selectAnswer,
    restart,
  };
}
