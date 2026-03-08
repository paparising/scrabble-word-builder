import { ValidationError } from '../../errors/validation-error';
import { ValidationService } from '../validation-service';

describe('ValidationService helper methods', () => {
  const letterData = {
    A: { score: 1, tiles: 9 },
    B: { score: 3, tiles: 2 },
    Z: { score: 10, tiles: 1 },
  };

  describe('countLetters', () => {
    it('counts letters case-insensitively', () => {
      const result = ValidationService.countLetters('aAb');

      expect(result).toEqual({
        A: 2,
        B: 1,
      });
    });

    it('returns empty object for empty input', () => {
      expect(ValidationService.countLetters('')).toEqual({});
    });
  });

  describe('validateCombinedLetters', () => {
    it('does nothing when board word is empty', () => {
      expect(() => {
        ValidationService.validateCombinedLetters('AB', '', letterData);
      }).not.toThrow();
    });

    it('throws ValidationError when combined tiles exceed limits', () => {
      expect(() => {
        ValidationService.validateCombinedLetters('AZ', 'Z', letterData);
      }).toThrow(ValidationError);

      expect(() => {
        ValidationService.validateCombinedLetters('AZ', 'Z', letterData);
      }).toThrow(/Letter 'Z' total count \(2\) exceeds available tiles \(1\)/);
    });
  });
});
