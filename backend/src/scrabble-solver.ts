import * as fs from 'fs';
import { buildAvailableLetters } from './find-best';

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

interface CachedWordEntry {
  word: string;
  score: number;
  usedLetters: { [letter: string]: number };
}

export class ScrabbleSolver {
  private static readonly DEFAULT_MAX_CACHED_DICTIONARY_BYTES = 20 * 1024 * 1024;
  private static readonly MAX_RESULT_CACHE_ENTRIES = 1000;

  private dictionaryPath: string;
  private cachedDictionaryWords: string[] | null = null;
  private cachedDictionaryEntries: CachedWordEntry[] | null = null;
  private letterData: LetterData;
  private maxCachedDictionaryBytes: number;
  private bestWordCache: Map<string, WordResult | null> = new Map();

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

  /**
   * Validate file exists and is readable
   */
  private validateFilePath(filePath: string, description: string): void {
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`✗ Failed to access ${description} from ${filePath}`);
      console.error(`  Error: ${errorMsg}`);
      throw new Error(`${description} initialization failed: ${errorMsg}`);
    }
  }

  /**
   * Iterate dictionary words from file without loading entire file into memory
   */
  private *iterateDictionaryWords(): Generator<string> {
    const fileDescriptor = fs.openSync(this.dictionaryPath, 'r');
    const bufferSize = 64 * 1024;
    const buffer = Buffer.alloc(bufferSize);
    let pending = '';

    try {
      let bytesRead: number;

      do {
        bytesRead = fs.readSync(fileDescriptor, buffer, 0, bufferSize, null);
        if (bytesRead <= 0) {
          break;
        }

        pending += buffer.toString('utf-8', 0, bytesRead);
        const lines = pending.split(/\r?\n/);
        pending = lines.pop() || '';

        for (const line of lines) {
          const word = line.trim().toUpperCase();
          if (word.length > 0) {
            yield word;
          }
        }
      } while (bytesRead > 0);

      const finalWord = pending.trim().toUpperCase();
      if (finalWord.length > 0) {
        yield finalWord;
      }
    } finally {
      fs.closeSync(fileDescriptor);
    }
  }

  /**
   * Load dictionary into memory when file size is reasonable; otherwise keep streaming mode
   */
  private initializeDictionarySource(): void {
    const dictionaryStats = fs.statSync(this.dictionaryPath);

    if (dictionaryStats.size <= this.maxCachedDictionaryBytes) {
      const dictContent = this.loadFile(this.dictionaryPath, 'Dictionary');
      this.cachedDictionaryWords = dictContent
        .split(/\r?\n/)
        .map(word => word.trim().toUpperCase())
        .filter(word => word.length > 0);

      // Precompute word score and letter counts once for fast repeated queries.
      this.cachedDictionaryEntries = this.cachedDictionaryWords.map((word) => ({
        word,
        score: this.calculateScore(word),
        usedLetters: this.countLetters(word),
      }));

      console.log(
        `✓ Dictionary loaded in memory from ${this.dictionaryPath} (${this.cachedDictionaryWords.length} words)`
      );
      return;
    }

    this.cachedDictionaryWords = null;
    this.cachedDictionaryEntries = null;
    console.log(
      `✓ Dictionary configured in streaming mode from ${this.dictionaryPath} (${dictionaryStats.size} bytes)`
    );
  }

  /**
   * Get dictionary words from memory cache or streaming iterator
   */
  private getDictionaryWords(): Iterable<string> {
    return this.cachedDictionaryWords ?? this.iterateDictionaryWords();
  }

  private buildAvailableLettersKey(availableLetters: { [letter: string]: number }): string {
    return Object.entries(availableLetters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, count]) => `${letter}${count}`)
      .join('|');
  }

  private cloneWordResult(result: WordResult): WordResult {
    return {
      word: result.word,
      score: result.score,
      usedLetters: { ...result.usedLetters },
    };
  }

  private getLetterBudget(availableLetters: { [letter: string]: number }): number {
    return Object.values(availableLetters).reduce((sum, count) => sum + count, 0);
  }

  private canUseLetters(
    requiredLetters: { [letter: string]: number },
    availableLetters: { [letter: string]: number }
  ): boolean {
    for (const [letter, count] of Object.entries(requiredLetters)) {
      if ((availableLetters[letter] || 0) < count) {
        return false;
      }
    }

    return true;
  }

  private pruneResultCacheIfNeeded(): void {
    if (this.bestWordCache.size < ScrabbleSolver.MAX_RESULT_CACHE_ENTRIES) {
      return;
    }

    const oldestKey = this.bestWordCache.keys().next().value;
    if (oldestKey) {
      this.bestWordCache.delete(oldestKey);
    }
  }

  private findBestWordFromCachedEntries(
    availableLetters: { [letter: string]: number }
  ): WordResult | null {
    if (!this.cachedDictionaryEntries) {
      return null;
    }

    const letterBudget = this.getLetterBudget(availableLetters);
    let bestWord: WordResult | null = null;
    let bestScore = 0;

    for (const entry of this.cachedDictionaryEntries) {
      if (entry.word.length < 2 || entry.word.length > 15 || entry.word.length > letterBudget) {
        continue;
      }

      if (!this.canUseLetters(entry.usedLetters, availableLetters)) {
        continue;
      }

      if (
        !bestWord ||
        entry.score > bestScore ||
        (entry.score === bestScore && entry.word.localeCompare(bestWord.word) < 0)
      ) {
        bestScore = entry.score;
        bestWord = {
          word: entry.word,
          score: entry.score,
          usedLetters: { ...entry.usedLetters },
        };
      }
    }

    return bestWord;
  }

  constructor(
    dictionaryPath: string,
    letterDataPath: string,
    maxCachedDictionaryBytes: number = ScrabbleSolver.DEFAULT_MAX_CACHED_DICTIONARY_BYTES
  ) {
    // Validate dictionary file path
    this.validateFilePath(dictionaryPath, 'Dictionary');
    // Load letter data
    const letterContent = this.loadFile(letterDataPath, 'Letter data');
    const letterJson = JSON.parse(letterContent);
    this.letterData = letterJson.letters;
    console.log(`✓ Letter data loaded successfully from ${letterDataPath}`);

    this.dictionaryPath = dictionaryPath;
    this.maxCachedDictionaryBytes = maxCachedDictionaryBytes;
    this.initializeDictionarySource();
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
   * Validate if a combination is a valid word
   */
  private isValidDictionaryWord(
    word: string,
    availableLetters: { [letter: string]: number }
  ): boolean {
    // Check if word length is valid (2-15 letters)
    if (word.length < 2 || word.length > 15) {
      return false;
    }

    // Check if can form from combined available letters
    if (!this.canFormWord(word, availableLetters)) {
      return false;
    }

    // Check tile limits (no letter exceeds max tiles in Scrabble)
    if (!this.checkTileLimit(word)) {
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
    const availableLetters = buildAvailableLetters(
      rack,
      boardWord,
      this.letterData
    );

    const cacheKey = this.buildAvailableLettersKey(availableLetters);
    const cachedResult = this.bestWordCache.get(cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult ? this.cloneWordResult(cachedResult) : null;
    }

    const cachedModeResult = this.findBestWordFromCachedEntries(availableLetters);
    if (this.cachedDictionaryEntries) {
      this.pruneResultCacheIfNeeded();
      this.bestWordCache.set(cacheKey, cachedModeResult ? this.cloneWordResult(cachedModeResult) : null);
      return cachedModeResult ? this.cloneWordResult(cachedModeResult) : null;
    }
    
    let bestWord: WordResult | null = null;
    let bestScore = 0;

    for (const candidateWord of this.getDictionaryWords()) {
      // Validate if candidate is a valid word
      if (!this.isValidDictionaryWord(candidateWord, availableLetters)) {
        continue;
      }

      // Calculate score
      const score = this.calculateScore(candidateWord);

      if (
        !bestWord ||
        score > bestScore ||
        (score === bestScore && candidateWord.localeCompare(bestWord.word) < 0)
      ) {
        bestScore = score;
        bestWord = {
          word: candidateWord,
          score,
          usedLetters: this.countLetters(candidateWord),
        };
      }
    }

    this.pruneResultCacheIfNeeded();
    this.bestWordCache.set(cacheKey, bestWord ? this.cloneWordResult(bestWord) : null);

    return bestWord;
  }
}
