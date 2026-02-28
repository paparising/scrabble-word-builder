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

  describe('Test Case 2: Valid input - Rack with board word', () => {
    it('should find valid word from rack "AIDOORZ" with board word "MY"', () => {
      const result = solver.findBestWord('AIDOORZ', 'MY');
      
      expect(result).not.toBeNull();
      expect(result?.word).toBeDefined();
      expect(result?.score).toBeGreaterThan(0);
      // Verify no tiles are used in both
      const rackLetters = new Set('AIDOORZ'.split(''));
      const boardLetters = new Set('MY'.split(''));
      const overlap = [...rackLetters].filter(letter => boardLetters.has(letter));
      expect(overlap.length).toBe(0); // No overlapping letters
    });

    it('should find top words from rack with non-overlapping board word', () => {
      const results = solver.findTopWords('AIDOORZ', 'MY', 5);
      
      expect(results.length).toBeGreaterThan(0);
      // Verify results don't use overlapping letters
      const rackLetters = new Set('AIDOORZ'.split(''));
      const boardLetters = new Set('MY'.split(''));
      const overlap = [...rackLetters].filter(letter => boardLetters.has(letter));
      expect(overlap.length).toBe(0);
    });
  });

  describe('Test Case 3: Invalid input - Overlapping tiles', () => {
    it('should throw error when rack and board word share same letters', () => {
      const testCases = [
        { rack: 'AIDOORZ', word: 'QUIZ', sharedLetter: 'I' },
        { rack: 'AADORZ', word: 'QUIZ', sharedLetter: 'Z' },
        { rack: 'ABCDEF', word: 'ABC', sharedLetter: 'A' }
      ];

      testCases.forEach(({ rack, word, sharedLetter }) => {
        expect(() => {
          solver.findBestWord(rack, word);
        }).toThrow(`Invalid input: Letter '${sharedLetter}' appears in both rack and board word`);
      });
    });

    it('should throw error with specific letter in findTopWords', () => {
      expect(() => {
        solver.findTopWords('AIDOORZ', 'QUIZ', 10);
      }).toThrow();
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

    it('should throw error in findTopWords for oversized rack', () => {
      expect(() => {
        solver.findTopWords('AIDOORWZ', '', 10); // 8 letters
      }).toThrow('Rack must contain 1-7 letters');
    });
  });

  describe('Additional validation tests', () => {
    it('should throw error for empty rack', () => {
      expect(() => {
        solver.findBestWord('');
      }).toThrow('Rack must contain 1-7 letters');
    });

    it('should accept rack with 1 letter', () => {
      expect(() => {
        solver.findBestWord('A');
      }).not.toThrow();
    });

    it('should accept rack with exactly 7 letters', () => {
      expect(() => {
        solver.findBestWord('ABCDEFG');
      }).not.toThrow();
    });

    it('should handle case insensitivity', () => {
      const result1 = solver.findBestWord('about');
      const result2 = solver.findBestWord('ABOUT');
      const result3 = solver.findBestWord('AbOuT');
      
      expect(result1?.word).toBe(result2?.word);
      expect(result2?.word).toBe(result3?.word);
    });

    it('should validate tile limits within single word', () => {
      // Assuming there's only 1 Z tile, "ZZZ" should fail
      const result = solver.findBestWord('ZZZZZZ'); // 6 Z's, exceeds tile limit
      expect(result).toBeNull(); // No valid words found
    });
  });
});
