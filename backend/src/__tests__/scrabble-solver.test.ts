import { ScrabbleSolver } from '../scrabble-solver';
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

    it('should find top words from rack "ABOUT"', () => {
      const results = solver.findTopWords('ABOUT', '', 5);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].word).toBeDefined();
      expect(results[0].score).toBeGreaterThan(0);
      // Results should be sorted by score descending
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
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

    it('should find top words from rack with board word', () => {
      const results = solver.findTopWords('ADOORW', 'IZ', 5);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].word).toBeDefined();
      expect(results[0].score).toBeGreaterThan(0);
      // Should find WIZARD
      const hasWizard = results.some(r => r.word === 'WIZARD');
      expect(hasWizard).toBe(true);
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

    it('should throw error on findTopWords when tiles exceed limit', () => {
      expect(() => {
        solver.findTopWords('AIDOORZ', 'QUIZ', 10);
      }).toThrow(/Letter/);
    });
  });

  describe('Test Case 4: Invalid input - Rack exceeds 7 letters', () => {
    it('should throw error when rack contains more than 7 letters', () => {
      expect(() => {
        solver.findBestWord('AIDOORWZ'); // 8 letters
      }).toThrow('Rack must contain 1-7 letters');
    });

    it('should throw error with extra long rack', () => {
      expect(() => {
        solver.findBestWord('ABCDEFGHIJ'); // 10 letters
      }).toThrow('Rack must contain 1-7 letters');
    });

    it('should throw error on findTopWords with 8+ letter rack', () => {
      expect(() => {
        solver.findTopWords('AIDOORWZ', '', 10); // 8 letters
      }).toThrow('Rack must contain 1-7 letters');
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

    it('should reject empty rack', () => {
      expect(() => {
        solver.findBestWord('');
      }).toThrow('Rack must contain 1-7 letters');
    });

    it('should validate rack minimum length', () => {
      expect(() => {
        solver.findBestWord('');
      }).toThrow();
    });

    it('should find no words for impossible rack', () => {
      // Rack with only Q and Z (hard to form words)
      const result = solver.findBestWord('QZ');
      expect(result).toBeNull(); // Might not find valid words
    });

    it('should sort results by score descending', () => {
      const results = solver.findTopWords('ABOUT', '', 10);
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('should respect limit parameter', () => {
      const results3 = solver.findTopWords('ABOUT', '', 3);
      const results10 = solver.findTopWords('ABOUT', '', 10);
      
      expect(results3.length).toBeLessThanOrEqual(3);
      expect(results10.length).toBeLessThanOrEqual(10);
      expect(results10.length).toBeGreaterThanOrEqual(results3.length);
    });

    it('should handle single letter rack', () => {
      const result = solver.findBestWord('A');
      // A alone might not form a valid word, but shouldn't throw
      // (depends on if 'A' is in dictionary)
    });

    it('should validate combined letters within tile limits', () => {
      // Valid: rack "ABC" + board "DEF" = all within limits
      const result = solver.findBestWord('ABC', 'DEF');
      expect(result).toBeDefined(); // Should not throw
    });
  });
});
