interface IWord {
  id: string;
  word: string;
  translation: string;
  partOfSpeech: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class Word implements IWord {
  constructor(
    public word: string,
    public translation: string,
    public partOfSpeech: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null,
    public id: string = crypto.randomUUID()
  ) {}
}

type Words = Array<Word>;

export { Word };
export type { IWord, Words };