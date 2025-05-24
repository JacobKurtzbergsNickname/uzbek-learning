import { useLocalStorage } from "../../data/useLocalStorage";
import { newWord, Word, Words } from "../../types/Word";
import { VocabularyContext } from "./VocabularyContext";
import { useState } from "react";

type ProviderProperties = {
    children: React.ReactNode
}

const localWords: Words = [
    { id: 1, word: "Salom",     translation: "Hello" },
    { id: 2, word: "Xayr",      translation: "Goodbye" },
    { id: 3, word: "Rahmat",    translation: "Thank you" },
];

// Create the provider component
export const VocabularyProvider: React.FC<ProviderProperties> = ({ children }) => {

    const words: Words = useLocalStorage<Words>("words", localWords)[0];
    const [correctWord, setCorrectWord] = useState<Word>(newWord());
    const [isAnswerSelected, setIsAnswerSelected] = useState<boolean>(false);
  
    return (
        <VocabularyContext.Provider value={{
            words,
            correctWord,
            setCorrectWord,
            isAnswerSelected,
            setIsAnswerSelected
        }}>
                {children}
        </VocabularyContext.Provider>
    )
  };