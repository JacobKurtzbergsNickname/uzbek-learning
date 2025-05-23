type WordDBO = Word & {
    createdAt: Date;
    updatedAt: Date;
}

type Word = {
    id: number;
    word: string;
    translation: string;
}

const newWord = (): Word => {
    return {
        id: 0,
        word: "",
        translation: ""
    }
}

type Words = Array<Word>;

export type { WordDBO, Words, Word };
export { newWord };