import * as fs from 'fs';
import * as path from 'path';

interface LetterData {
  [letter: string]: {
    score: number;
    tiles: number;
  };
}

interface WordResult {
  word: string;
  score: number;
  usedLetters: { [letter: string]: number };
}

export class ScrabbleSolver {
  private dictionary: Set<string>;
  private letterData: LetterData;

  /**
   * Load file with error handling
   */
  private loadFile(filePath: string, description: string): string {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`✗ Failed to load ${description} from ${filePath}`);
      console.error(`  Error: ${errorMsg}`);
      throw new Error(`${description} initialization failed: ${errorMsg}`);
    }
  }

  constructor(dictionaryPath: string, letterDataPath: string) {
    // Load dictionary
    const dictContent = this.loadFile(dictionaryPath, 'Dictionary');
    this.dictionary = new Set(
      dictContent
        .split('\n')
        .map(word => word.trim().toUpperCase())
        .filter(word => word.length > 0)
    );
    console.log(`✓ Dictionary loaded successfully from ${dictionaryPath} (${this.dictionary.size} words)`);

    // Load letter data
    const letterContent = this.loadFile(letterDataPath, 'Letter data');
    const letterJson = JSON.parse(letterContent);
    this.letterData = letterJson.letters;
    console.log(`✓ Letter data loaded successfully from ${letterDataPath}`);
  }

  /**
   * Calculate the score for a word
   */
  private calculateScore(word: string): number {
    return word
      .split('')
      .reduce((score, letter) => {
        const data = this.letterData[letter];
        return score + (data ? data.score : 0);
      }, 0);
  }

  /**
   * Count letter frequencies in a string
   */
  private countLetters(text: string): { [letter: string]: number } {
    const counts: { [letter: string]: number } = {};
    for (const letter of text.toUpperCase()) {
      counts[letter] = (counts[letter] || 0) + 1;
    }
    return counts;
  }

  /**
   * Check if a word can be formed from available letters
   */
  private canFormWord(
    word: string,
    availableLetters: { [letter: string]: number }
  ): boolean {
    const wordLetters = this.countLetters(word);
    for (const [letter, count] of Object.entries(wordLetters)) {
      if ((availableLetters[letter] || 0) < count) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if total letter usage doesn't exceed available tiles
   */
  private checkTileLimit(word: string): boolean {
    const wordLetters = this.countLetters(word);
    for (const [letter, count] of Object.entries(wordLetters)) {
      const maxTiles = this.letterData[letter]?.tiles || 0;
      if (count > maxTiles) {
        return false;
      }
    }
    return true;
  }

  /**
   * Validate combined rack + board word doesn't exceed tile limits
   */
  private validateCombinedLetters(rack: string, boardWord: string): void {
    if (!boardWord) return;
    
    const combinedLetters = this.countLetters(rack + boardWord);
    for (const [letter, count] of Object.entries(combinedLetters)) {
      const maxTiles = this.letterData[letter]?.tiles || 0;
      if (count > maxTiles) {
        throw new Error(
          `Invalid input: Letter '${letter}' total count (${count}) exceeds available tiles (${maxTiles})`
        );
      }
    }
  }

  /**
   * Generate all possible combinations of letters
   */
  private generateCombinations(
    letters: string,
    minLength: number = 2,
    maxLength: number = 15
  ): string[] {
    const letterArray = letters.toUpperCase().split('');
    const combinations: Set<string> = new Set();

    const generate = (current: string, remaining: string[]) => {
      if (current.length >= minLength && current.length <= maxLength) {
        combinations.add(current);
      }
      if (current.length >= maxLength || remaining.length === 0) {
        return;
      }

      for (let i = 0; i < remaining.length; i++) {
        const newRemaining = [
          ...remaining.slice(0, i),
          ...remaining.slice(i + 1),
        ];
        generate(current + remaining[i], newRemaining);
      }
    };

    generate('', letterArray);
    return Array.from(combinations);
  }

  /**
   * Validate if a combination is a valid word
   */
  private isValidComboWord(
    combo: string,
    availableLetters: { [letter: string]: number }
  ): boolean {
    // Check if word exists in dictionary
    if (!this.dictionary.has(combo)) {
      return false;
    }

    // Check if word length is valid (2-15 letters)
    if (combo.length < 2 || combo.length > 15) {
      return false;
    }

    // Check if can form from combined available letters
    if (!this.canFormWord(combo, availableLetters)) {
      return false;
    }

    // Check tile limits (no letter exceeds max tiles in Scrabble)
    if (!this.checkTileLimit(combo)) {
      return false;
    }

    return true;
  }

  /**
   * Find the highest scoring valid word
   */
  public findBestWord(
    rack: string,
    boardWord: string = ''
  ): WordResult | null {
    // Validate rack length
    if (!rack || rack.length < 1 || rack.length > 7) {
      throw new Error('Rack must contain 1-7 letters');
    }

    // Validate combined rack + board word doesn't exceed tile limits
    this.validateCombinedLetters(rack, boardWord);

    // Combine rack and board word to get available letters
    const availableLetters = this.countLetters(rack + boardWord);
    
    // Generate combinations from available letters (including board word letters)
    const rackChars = rack.toUpperCase().split('');
    const boardChars = boardWord.toUpperCase().split('');
    const allLetters = rackChars.concat(boardChars);
    
    const combinations = this.generateCombinations(allLetters.join(''), 2, 15);

    let bestWord: WordResult | null = null;
    let bestScore = 0;

    for (const combo of combinations) {
      // Validate if combo is a valid word
      if (!this.isValidComboWord(combo, availableLetters)) {
        continue;
      }

      // Calculate score
      const score = this.calculateScore(combo);

      if (
        !bestWord ||
        score > bestScore ||
        (score === bestScore && combo.localeCompare(bestWord.word) < 0)
      ) {
        bestScore = score;
        bestWord = {
          word: combo,
          score,
          usedLetters: this.countLetters(combo),
        };
      }
    }

    return bestWord;
  }
}
