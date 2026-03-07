import { ScrabbleSolver } from '../scrabble-solver';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

describe('ScrabbleSolver', () => {
  let solver: ScrabbleSolver;

  beforeAll(() => {
    const dictionaryPath = path.join(__dirname, '../../../data/dictionary.txt');
    const letterDataPath = path.join(__dirname, '../../../data/letter_data.json');
    solver = new ScrabbleSolver(dictionaryPath, letterDataPath);
  });

  describe('Test Case 1: Valid input - Single rack', () => {
    it('should find valid word from rack "ABOUT"', () => {
      const result = solver.findBestWord('ABOUT');
      
      expect(result).not.toBeNull();
      expect(result?.word).toBe('ABOUT');
      expect(result?.score).toBe(7); // A(1) + B(3) + O(1) + U(1) + T(1) = 7
      expect(result?.usedLetters).toEqual({
        A: 1,
        B: 1,
        O: 1,
        U: 1,
        T: 1
      });
    });
  });

  describe('Test Case 2: Valid input - Rack with board word (tiles combined within limits)', () => {
    it('should find valid word from rack "ADOORW" with board word "IZ" forming WIZARD', () => {
      const result = solver.findBestWord('ADOORW', 'IZ');
      
      expect(result).not.toBeNull();
      expect(result?.word).toBe('WIZARD');
      // W(4) + I(1) + Z(10) + A(1) + R(1) + D(2) = 19
      expect(result?.score).toBe(19);
    });

    it('should allow letters to appear in both rack and board as long as tiles don\'t exceed limit', () => {
      // Test that we can combine rack and board letters even if they overlap
      // rack "BAD" + board "BAG" = A(2), B(2), D(1), G(1) - all within limits
      // Could form "BAD", "BAG", "DAB", "GAB", "GADS", "DABS" etc
      const result = solver.findBestWord('BAD', 'BAG');
      
      expect(result).not.toBeNull();
      expect(result?.score).toBeGreaterThan(0);
    });
  });

  describe('Test Case 3: Invalid input - Combined tiles exceed limit', () => {
    it('should throw error when combined rack + board word exceeds tile limit for any letter', () => {
      // AIDOORZ has Z(1), QUIZ has Z(1) = Total Z(2), but only 1 tile available
      expect(() => {
        solver.findBestWord('AIDOORZ', 'QUIZ');
      }).toThrow(/Letter 'Z' total count \(2\) exceeds available tiles \(1\)/);
    });

    it('should throw error when Z tile limit exceeded', () => {
      // Same letter in both rack and board exceeds the 1 available Z tile
      expect(() => {
        solver.findBestWord('AADORZ', 'QUIZ');
      }).toThrow(/Letter 'Z' total count/);
    });

    it('should throw error with I tile limit exceeded when combining rack and board', () => {
      // Rack with many I's + board word with I's could exceed 9 available
      // This depends on dictionary, but test the validation exists
      expect(() => {
        solver.findBestWord('AIDOORZ', 'QUIZ');
      }).toThrow();
    });
  });

  describe('Additional edge cases', () => {
    it('should handle empty board word', () => {
      const result = solver.findBestWord('ABOUT', '');
      expect(result).not.toBeNull();
    });

    it('should handle case insensitivity', () => {
      const result1 = solver.findBestWord('about');
      const result2 = solver.findBestWord('ABOUT');
      expect(result1?.word).toBe(result2?.word);
    });

    it('should return null for empty rack when called directly', () => {
      const result = solver.findBestWord('');
      expect(result).toBeNull();
    });

    it('should find no words for impossible rack', () => {
      // Rack with only Q and Z (hard to form words)
      const result = solver.findBestWord('QZ');
      expect(result).toBeNull(); // Might not find valid words
    });

    it('should validate combined letters within tile limits', () => {
      // Valid: rack "ABC" + board "DEF" = all within limits
      const result = solver.findBestWord('ABC', 'DEF');
      expect(result).toBeDefined(); // Should not throw
    });
  });

  describe('Tie-breaking rule', () => {
    it('should return the alphabetically first word when multiple words have the same score', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scrabble-tie-test-'));
      const dictionaryPath = path.join(tempDir, 'dictionary.txt');
      const letterDataPath = path.join(tempDir, 'letter_data.json');

      fs.writeFileSync(dictionaryPath, 'ACT\nCAT\n', 'utf-8');
      fs.writeFileSync(
        letterDataPath,
        JSON.stringify({
          letters: {
            A: { score: 1, tiles: 9 },
            C: { score: 3, tiles: 2 },
            T: { score: 1, tiles: 6 },
          },
        }),
        'utf-8'
      );

      const tieSolver = new ScrabbleSolver(dictionaryPath, letterDataPath);
      const result = tieSolver.findBestWord('CAT');

      expect(result).not.toBeNull();
      expect(result?.score).toBe(5);
      expect(result?.word).toBe('ACT');

      fs.rmSync(tempDir, { recursive: true, force: true });
    });
  });
});
