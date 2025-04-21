import { Words } from "@/types/Word";
import { createContext } from "react";

// Define the initial state for the context
export interface VocabContextProperties {
    words:     Words
  }

const initialVocabContext: VocabContextProperties = {
words:       [],
};

export const VocabularyContext = createContext(initialVocabContext);