import React, { useEffect, useRef, useState, ChangeEvent, FormEvent } from 'react';
import './App.css';
import { ApiError, findBestWordRequest, type WordResult } from './services/scrabbleApi';

const LETTERS_ONLY_REGEX = /^[A-Z]+$/;

const App: React.FC = () => {
  const [rack, setRack] = useState<string>('');
  const [boardWord, setBoardWord] = useState<string>('');
  const [bestWord, setBestWord] = useState<WordResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const errorRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
      return;
    }

    if (bestWord) {
      resultRef.current?.focus();
    }
  }, [error, bestWord]);

  const normalizeInput = (value: string): string => value.trim().toUpperCase();

  const hasInvalidCharacters = (value: string): boolean => {
    if (!value) {
      return false;
    }

    return !LETTERS_ONLY_REGEX.test(value);
  };

  const validateInput = (): boolean => {
    const normalizedRack = normalizeInput(rack);
    const normalizedBoardWord = normalizeInput(boardWord);

    setError('');

    if (!normalizedRack) {
      setError('Rack cannot be empty');
      return false;
    }

    if (normalizedRack.length > 7) {
      setError('Rack cannot exceed 7 letters');
      return false;
    }

    if (hasInvalidCharacters(normalizedRack)) {
      setError('Rack must contain letters A-Z only');
      return false;
    }

    if (normalizedBoardWord && hasInvalidCharacters(normalizedBoardWord)) {
      setError('Board word must contain letters A-Z only');
      return false;
    }

    return true;
  };

  const findBestWord = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateInput()) return;

    setLoading(true);
    setError('');
    setBestWord(null);

    try {
      const result = await findBestWordRequest({
        rack: normalizeInput(rack),
        word: normalizeInput(boardWord) || undefined,
      });

      setBestWord(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }

      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎮 Scrabble Word Builder</h1>
        <p className="subtitle">
          Find the highest scoring valid word based on your rack
        </p>
      </header>

      <main className="app-main">
        <section className="input-section">
          <div className="form-wrapper">
            <form onSubmit={findBestWord} className="scrabble-form" noValidate>
              <div className="form-group">
                <label htmlFor="rack">Player Rack *</label>
                <input
                  id="rack"
                  type="text"
                  value={rack}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setRack(e.target.value.toUpperCase())
                  }
                  placeholder="Enter letters (max 7)"
                  className="form-input"
                  maxLength={7}
                  inputMode="text"
                  pattern="[A-Za-z]*"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(error)}
                  aria-describedby="rack-help"
                  disabled={loading}
                />
                <small id="rack-help" className="form-help">
                  {rack.length}/7 letters
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="boardWord">Board Word (Optional)</label>
                <input
                  id="boardWord"
                  type="text"
                  value={boardWord}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setBoardWord(e.target.value.toUpperCase())
                  }
                  placeholder="Optional word to build upon"
                  className="form-input"
                  inputMode="text"
                  pattern="[A-Za-z]*"
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby="board-word-help"
                  disabled={loading}
                />
                <small id="board-word-help" className="form-help">
                  Letters A-Z only
                </small>
              </div>

              <div className="button-group">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || normalizeInput(rack).length === 0}
                >
                  {loading ? 'Finding...' : '🎯 Find Best Word'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {error && (
          <div
            ref={errorRef}
            className="error-message"
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
          >
            {error}
          </div>
        )}

        {bestWord && (
          <section
            ref={resultRef}
            className="result-section"
            aria-live="polite"
            tabIndex={-1}
          >
            <h2>Best Word Found</h2>
            <div className="word-card">
              <div className="word-display">{bestWord.word}</div>
              <div className="score-display">Score: {bestWord.score}</div>
              <div className="letters-used">
                <strong>Letters used:</strong>
                <div className="letter-list">
                  {Object.entries(bestWord.usedLetters).map(
                    ([letter, count]) => (
                      <span key={letter} className="letter-count">
                        {letter}
                        {count > 1 && `×${count}`}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="info-section">
          <h3>📚 Rules</h3>
          <ul>
            <li>Rack must contain 1-7 letters</li>
            <li>Valid words are 2-15 letters long</li>
            <li>Words must exist in the dictionary</li>
            <li>Letter usage cannot exceed tile availability</li>
            <li>Scoring is based on standard Scrabble values</li>
          </ul>
        </section>
      </main>

      <footer className="app-footer">
        <p>
          © 2026 Scrabble Word Builder | Built with TypeScript, React & Express
        </p>
      </footer>
    </div>
  );
};

export default App;
