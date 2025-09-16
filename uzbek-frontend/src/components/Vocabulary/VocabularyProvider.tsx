import { useLocalStorage } from "../../data/useLocalStorage";
import { emptyWord, Word, Words } from "../../types/Word";
import { VocabularyContext } from "./VocabularyContext";
import { useState } from "react";

type ProviderProperties = {
    children: React.ReactNode
}

const localWords: Words = [
    { id: 1, word: "Salom",     translation: "Hello" },
    { id: 2, word: "Xayr",      translation: "Goodbye" },
    { id: 3, word: "Rahmat",    translation: "Thank you" },
    { id: 4, word: "Iltimos",   translation: "Please" },
    { id: 5, word: "Ha",        translation: "Yes" },
    { id: 6, word: "Yo'q",      translation: "No" },
    { id: 7, word: "Qanday?",   translation: "How?" },
    { id: 8, word: "Nima?",     translation: "What?" },
    { id: 9, word: "Kim?",      translation: "Who?" },
    { id: 10, word: "Qayerda?", translation: "Where?" }
];

// Create the provider component
export const VocabularyProvider: React.FC<ProviderProperties> = ({ children }) => {

    const words: Words = 
        useLocalStorage<Words>("words", localWords)[0];
    const [correctWord, setCorrectWord] = useState<Word>(emptyWord());
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