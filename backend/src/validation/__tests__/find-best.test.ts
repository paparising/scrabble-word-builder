import { findBestWordInputSchema } from '../find-best';

describe('findBestWordInputSchema', () => {
  it('parses and normalizes valid payload', () => {
    const parsed = findBestWordInputSchema.parse({
      rack: ' about ',
      word: ' wiz ',
    });

    expect(parsed).toEqual({
      rack: 'ABOUT',
      word: 'WIZ',
    });
  });

  it('normalizes empty board word to undefined', () => {
    const parsed = findBestWordInputSchema.parse({
      rack: 'ABOUT',
      word: '   ',
    });

    expect(parsed).toEqual({
      rack: 'ABOUT',
      word: undefined,
    });
  });

  it('rejects rack shorter than one letter after trim', () => {
    const result = findBestWordInputSchema.safeParse({
      rack: '   ',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Rack must contain 1-7 letters');
    }
  });

  it('rejects board word with non-letter characters', () => {
    const result = findBestWordInputSchema.safeParse({
      rack: 'ABOUT',
      word: 'W!Z',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Word must contain only letters A-Z');
    }
  });
});
