import { WordDAO, AnswerOptionDTO } from "../types";

// The original function
export function composeTestableWords(
  correctWord: WordDAO, 
  wrongWords: WordDAO[]
): ChainableArray<string> {
  // Create a chainable array instance with the words
  return new ChainableArray([
    correctWord.word, 
    ...wrongWords.map((w: WordDAO) => w.word)
  ]);
}

// Extension method for the array
export function toAnswerOptions(words: string[]): AnswerOptionDTO[] {
  // Implement the actual logic here
  return words.map((word, index) => ({
    word,
    isCorrect: index === 0, 
    isSelected: false,
  }));
}

// Create a wrapper class that extends Array and adds chainable methods
class ChainableArray<T extends string> extends Array<T> {
  constructor(items?: T[]) {
    // If items are provided, initialize with them
    super(...(items || []));
  }
  
  // Add the toAnswerOptions method to the chainable array
  toAnswerOptions(): AnswerOptionDTO[] {
    return toAnswerOptions(this);
  }
}
