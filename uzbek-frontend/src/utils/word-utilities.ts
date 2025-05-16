import { WordDAO, AnswerOptionDTO } from "../types";
import { ChainableArray } from "./chainable-functions";

/**
 * A chainable array implementation that supports method chaining
 * with proper TypeScript typing across different data types
 * 
 * Example usage:
 * const options = 
 *    WordUtils
 *      .composeTestableWords(correctWord, wrongWords)
 *      .toAnswerOptions()
 *      .shuffle();
 */
export class WordFunctionsArray<T> extends ChainableArray<T> {
  /**
   * Convert string array to answer options
   * Only available when T is string
   */
  toAnswerOptions(this: WordFunctionsArray<string>): WordFunctionsArray<AnswerOptionDTO> {
    const options = WordUtils.toAnswerOptions([...this]);
    return new WordFunctionsArray<AnswerOptionDTO>(options);
  }
  
  /**
   * Shuffle the array elements
   */
  shuffle(): WordFunctionsArray<T> {
    const shuffled = WordUtils.shuffle([...this]);
    return new WordFunctionsArray<T>(shuffled);
  }
}

interface IWordUtils {
  composeTestableWords: (correctWord: WordDAO, wrongWords: WordDAO[]) => WordFunctionsArray<string>;
  toAnswerOptions: (words: string[]) => AnswerOptionDTO[];
  shuffle: <T>(array: T[]) => T[];
}

/**
 * Word utilities namespace containing functions for word operations
 */
export const WordUtils: IWordUtils = {
  /**
   * Creates a chainable array of testable words from correct and wrong options
   */
  composeTestableWords(correctWord: WordDAO, wrongWords: WordDAO[]): WordFunctionsArray<string> {
    return new WordFunctionsArray<string>([
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

