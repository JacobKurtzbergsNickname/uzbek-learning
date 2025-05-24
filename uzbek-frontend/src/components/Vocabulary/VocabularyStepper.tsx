import { JSX, useContext, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { VocabularyTest } from "./VocabularyTest";
import { VocabularyContext } from "./VocabularyContext";
import { Word } from "@/types/Word";

export function VocabularyStepper(): JSX.Element {
    const [currentWord, setCurrentWord] = useState<Word>();
    const { words, setIsAnswerSelected } = useContext(VocabularyContext)

    const defaultWord = words[0]?.word || "No words available";

    function handleWordChange(word: string) {
        console.log("Selected word:", word);
        const selectedWord = words.find((w) => w.word === word);
        setCurrentWord(selectedWord);
        setIsAnswerSelected(false);
    }

    return (
        <Tabs onValueChange={(value) => handleWordChange(value)}>
            <TabsList 
                defaultValue={defaultWord} 
                className="w-full">
                {words.map((word) => (
                    <TabsTrigger key={word.id} value={word.word}>
                        {word.id}
                    </TabsTrigger>
                ))}
            </TabsList>
            <TabsContent value={currentWord?.word ?? "Test"} className="w-full">
                <VocabularyTest correctWord={currentWord} />
            </TabsContent>
        </Tabs>
    );
}