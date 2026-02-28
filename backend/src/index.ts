import express, { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import cors from 'cors';
import { ScrabbleSolver } from './scrabble-solver';

const app = express();
const PORT = process.env.PORT || 5123;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Scrabble Solver
const dictionaryPath = path.join(__dirname, '../../data/dictionary.txt');
const letterDataPath = path.join(__dirname, '../../data/letter_data.json');
let solver: ScrabbleSolver;

try {
  solver = new ScrabbleSolver(dictionaryPath, letterDataPath);
  console.log('Scrabble Solver initialized successfully');
} catch (error) {
  console.error('Failed to initialize Scrabble Solver:', error);
  process.exit(1);
}

// Routes

/**
 * Find the best word for a given rack
 * POST /api/find-best
 * Body: { rack: string, word?: string }
 */
app.post('/find-best', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rack, word } = req.body;

    if (!rack || typeof rack !== 'string') {
      return res.status(400).json({ error: 'Rack is required and must be a string' });
    }

    if (rack.length < 1 || rack.length > 7) {
      return res.status(400).json({ error: 'Rack must contain 1-7 letters' });
    }

    const result = solver.findBestWord(rack, word || '');

    if (!result) {
      return res.status(404).json({ message: 'No valid words found' });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Find top N scoring words for a given rack
 * POST /api/find-top
 * Body: { rack: string, word?: string, limit?: number }
 */
app.post('/find-top', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rack, word, limit = 10 } = req.body;

    if (!rack || typeof rack !== 'string') {
      return res.status(400).json({ error: 'Rack is required and must be a string' });
    }

    if (rack.length < 1 || rack.length > 7) {
      return res.status(400).json({ error: 'Rack must contain 1-7 letters' });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }

    const results = solver.findTopWords(rack, word || '', limit);

    res.json({ count: results.length, words: results });
  } catch (error) {
    next(error);
  }
});

/**
 * Health check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ error: error.message || 'Internal server error' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Scrabble Word Builder API listening on port ${PORT}`);
});

export default app;
