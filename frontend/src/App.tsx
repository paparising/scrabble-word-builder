import React, { useState, ChangeEvent, FormEvent } from 'react';
import './App.css';

interface WordResult {
  word: string;
  score: number;
  usedLetters: { [key: string]: number };
}

interface ApiResponse {
  word?: string;
  score?: number;
  usedLetters?: { [key: string]: number };
  message?: string;
  count?: number;
  words?: WordResult[];
  error?: string;
}

const App: React.FC = () => {
  const [rack, setRack] = useState<string>('');
  const [boardWord, setBoardWord] = useState<string>('');
  const [bestWord, setBestWord] = useState<WordResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const validateInput = (): boolean => {
    setError('');
    if (!rack.trim()) {
      setError('Rack cannot be empty');
      return false;
    }
    if (rack.length > 7) {
      setError('Rack cannot exceed 7 letters');
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
      const response = await fetch('/api/find-best', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rack: rack.trim(),
          word: boardWord.trim() || undefined,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || 'Failed to find word');
        return;
      }

      if (data.word) {
        setBestWord({
          word: data.word,
          score: data.score || 0,
          usedLetters: data.usedLetters || {},
        });
      } else {
        setError(data.message || 'No valid words found for this rack');
      }
    } catch (err) {
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
            <form onSubmit={findBestWord} className="scrabble-form">
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
                  disabled={loading}
                />
                <small className="form-help">
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
                  disabled={loading}
                />
              </div>

              <div className="button-group">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || rack.length === 0}
                >
                  {loading ? 'Finding...' : '🎯 Find Best Word'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {error && <div className="error-message">{error}</div>}

        <div className="results-rules-container">
          {bestWord && (
            <section className="result-section">
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
        </div>
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
