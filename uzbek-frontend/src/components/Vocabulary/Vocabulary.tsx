import { JSX } from "react";
import { VocabularyStepper } from "./VocabularyStepper";
import { VocabularyProvider } from "./VocabularyProvider";



function Vocabulary(): JSX.Element {

    return (
        <section>
            <VocabularyProvider>
                <VocabularyStepper/>
            </VocabularyProvider>
        </section>
    )
}

export default Vocabulary;