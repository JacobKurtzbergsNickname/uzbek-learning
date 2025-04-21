type Word = WordDAO & {
    createdAt: Date;
    updatedAt: Date;
}

type WordDAO = {
    id: number;
    word: string;
    translation: string;
}

type Words = Array<WordDAO>;

export type { Word, Words, WordDAO };