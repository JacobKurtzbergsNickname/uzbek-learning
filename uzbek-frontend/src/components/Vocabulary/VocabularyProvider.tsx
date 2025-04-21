import { useLocalStorage } from "../../data/useLocalStorage";
import { Words } from "@/types/Word";
import { VocabularyContext } from "./VocabularyContext";

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
  
    return (
        <VocabularyContext.Provider value={{words}}>
                {children}
        </VocabularyContext.Provider>
    )
  };