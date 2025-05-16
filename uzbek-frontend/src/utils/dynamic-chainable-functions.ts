import { WordDAO, AnswerOptionDTO } from "../types";
/**
 * A more dynamic chainable array implementation that supports method chaining
 * with proper TypeScript typing
 */
export class ChainableArray<T, U = T> extends Array<T> {
  constructor(items?: T[]) {
    super(...(items || []));
  }

  /**
   * Create a new chainable array with transformed values
   */
  pipe<V>(transform: (arr: T[]) => V[]): ChainableArray<V, U> {
    const result = transform([...this]);
    return new ChainableArray<V, U>(result);
  }

  /**
   * Transform the array into a non-chainable value
   */
  transform<V>(transform: (arr: T[]) => V): V {
    return transform([...this]);
  }
}

/**
 * Word utilities namespace containing functions for word operations
 */
export const WordUtils = {
  /**
   * Creates a chainable array of testable words from correct and wrong options
   */
  composeTestableWords(correctWord: WordDAO, wrongWords: WordDAO[]): ChainableArray<string> {
    return new ChainableArray<string>([
      correctWord.word,
      ...wrongWords.map((w: WordDAO) => w.word)
    ]);
  },

  /**
   * Transforms string words into answer options
   */
  toAnswerOptions(words: string[]): AnswerOptionDTO[] {
    return words.map((word, index) => ({
      word,
      isCorrect: index === 0,
      isSelected: false,
    }));
  },
  
  /**
   * Shuffles the elements of an array randomly
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
};