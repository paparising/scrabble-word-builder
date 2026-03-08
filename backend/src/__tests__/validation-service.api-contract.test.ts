import { ValidationService } from '../validation/validation-service';

describe('ValidationService', () => {
  describe('validateFindBestWordInput', () => {
    it('returns normalized uppercase values for valid payload', () => {
      const result = ValidationService.validateFindBestWordInput({
        rack: ' about ',
        word: ' wiz ',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          rack: 'ABOUT',
          word: 'WIZ',
        });
      }
    });

    it('normalizes empty board word to undefined', () => {
      const result = ValidationService.validateFindBestWordInput({
        rack: 'ABOUT',
        word: '   ',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          rack: 'ABOUT',
          word: undefined,
        });
      }
    });

    it('fails when rack is missing', () => {
      const result = ValidationService.validateFindBestWordInput({
        word: 'WIZ',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Rack is required and must be a string');
      }
    });

    it('fails when rack exceeds 7 letters', () => {
      const result = ValidationService.validateFindBestWordInput({
        rack: 'AIDOORWZ',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Rack must contain 1-7 letters');
      }
    });

    it('fails when rack contains non-letter characters', () => {
      const result = ValidationService.validateFindBestWordInput({
        rack: 'AB1',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Rack must contain only letters A-Z');
      }
    });

    it('fails when board word contains non-letter characters', () => {
      const result = ValidationService.validateFindBestWordInput({
        rack: 'ABOUT',
        word: 'W1Z',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Word must contain only letters A-Z');
      }
    });

    it('fails when board word is not a string', () => {
      const result = ValidationService.validateFindBestWordInput({
        rack: 'ABOUT',
        word: 10,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Word must be a string');
      }
    });

    it('fails when unexpected keys are present', () => {
      const result = ValidationService.validateFindBestWordInput({
        rack: 'ABOUT',
        extra: 'value',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Unrecognized key');
      }
    });
  });
});
