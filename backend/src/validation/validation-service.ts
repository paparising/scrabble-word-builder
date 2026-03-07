import { FindBestWordInput, findBestWordInputSchema } from './find-best';
import { ValidationError } from '../errors/validation-error';

interface LetterInfo {
  score: number;
  tiles: number;
}

type LetterDataMap = Record<string, LetterInfo>;

export interface ValidationResult<T> {
  success: true;
  data: T;
}

interface ValidationFailure {
  success: false;
  error: string;
}

export type ValidationResponse<T> = ValidationResult<T> | ValidationFailure;

export class ValidationService {
  public static countLetters(text: string): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const letter of text.toUpperCase()) {
      counts[letter] = (counts[letter] || 0) + 1;
    }
    return counts;
  }

  public static validateCombinedLetters(
    rack: string,
    boardWord: string,
    letterData: LetterDataMap
  ): void {
    if (!boardWord) {
      return;
    }

    const combinedLetters = ValidationService.countLetters(rack + boardWord);
    for (const [letter, count] of Object.entries(combinedLetters)) {
      const maxTiles = letterData[letter]?.tiles || 0;
      if (count > maxTiles) {
        throw new ValidationError(
          `Invalid input: Letter '${letter}' total count (${count}) exceeds available tiles (${maxTiles})`
        );
      }
    }
  }

  public static buildAvailableLetters(
    rack: string,
    boardWord: string,
    letterData: LetterDataMap
  ): Record<string, number> {
    ValidationService.validateCombinedLetters(rack, boardWord, letterData);
    return ValidationService.countLetters(rack + boardWord);
  }

  public static validateFindBestWordInput(payload: unknown): ValidationResponse<FindBestWordInput> {
    const parsed = findBestWordInputSchema.safeParse(payload);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message || 'Invalid request body',
      };
    }

    return {
      success: true,
      data: parsed.data,
    };
  }
}
