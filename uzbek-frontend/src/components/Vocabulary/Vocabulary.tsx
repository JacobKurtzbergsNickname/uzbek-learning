"use client";
import { JSX } from "react";
// import TimedVocabularyTest from "./TimedVocabularyTest";
import { VocabularyContext } from "./VocabularyContext";
import { VocabularyProvider } from "./VocabularyProvider";
import TimedVocabularyTest from "./TimedVocabularyTest";

function Vocabulary(): JSX.Element {
  return (
    <section>
      <VocabularyProvider>
        <VocabularyContext.Consumer>
          {({ words }) => (
            <TimedVocabularyTest words={words} onComplete={() => {}} />
          )}
        </VocabularyContext.Consumer>
      </VocabularyProvider>
    </section>
  );
}

export default Vocabulary;
