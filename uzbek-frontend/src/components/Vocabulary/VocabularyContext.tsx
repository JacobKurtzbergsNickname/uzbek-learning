import { newWord, Word, Words } from "../../types/Word";
import { createContext, Dispatch, SetStateAction } from "react";

// Define the initial state for the context
export interface VocabContextProperties {
  words: Words;
  correctWord: Word;
  setCorrectWord: Dispatch<SetStateAction<Word>>;
  isAnswerSelected: boolean;
  setIsAnswerSelected: Dispatch<SetStateAction<boolean>>;
}

const initialVocabContext: VocabContextProperties = {
  // Initialize with an empty array of words
  words:       [],

  // Initialize with a new word object
  correctWord: newWord(),

  // Placeholder function, will be replaced by the provider
  setCorrectWord: () => {},

  // Initial state for answer selection
  isAnswerSelected: false,

  // Placeholder function for setting answer selection state
  setIsAnswerSelected: () => {},
};

export const VocabularyContext = createContext(initialVocabContext);