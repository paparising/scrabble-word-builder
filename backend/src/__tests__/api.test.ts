import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as path from 'path';
import { ScrabbleSolver } from '../scrabble-solver';

describe('Scrabble Word Builder API', () => {
  let app: Express;
  let solver: ScrabbleSolver;

  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(express.json());

    const dictionaryPath = path.join(__dirname, '../../../data/dictionary.txt');
    const letterDataPath = path.join(__dirname, '../../../data/letter_data.json');
    solver = new ScrabbleSolver(dictionaryPath, letterDataPath);

    // POST /find-best endpoint
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

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok' });
    });

    // Error handling middleware
    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    });
  });

  describe('Test Case 1: Valid input - Single rack', () => {
    it('POST /find-best should return best word for rack "ABOUT"', async () => {
      const response = await request(app)
        .post('/find-best')
        .send({ rack: 'ABOUT' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('word');
      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('usedLetters');
      expect(response.body.word).toBe('ABOUT');
    });
  });

  describe('Test Case 2: Valid input - Rack with board word', () => {
    it('POST /find-best should find word with non-overlapping board word', async () => {
      const response = await request(app)
        .post('/find-best')
        .send({ rack: 'AIDOORZ', word: 'MY' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('word');
      expect(response.body).toHaveProperty('score');
      expect(response.body.score).toBeGreaterThan(0);
    });
  });

  describe('Test Case 3: Invalid input - Overlapping tiles', () => {
    it('POST /find-best should return error for overlapping rack and board word', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      try {
        const response = await request(app)
          .post('/find-best')
          .send({ rack: 'AIDOORZ', word: 'QUIZ' });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Invalid input');
        expect(response.body.error).toContain('total count');
        expect(response.body.error).toContain('exceeds available tiles');
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it('POST /find-best should specifically detect Z tile limit exceeded', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      try {
        const response = await request(app)
          .post('/find-best')
          .send({ rack: 'AADORZ', word: 'QUIZ' });

        expect(response.status).toBe(500);
        expect(response.body.error).toContain(`Letter 'Z'`);
        expect(response.body.error).toContain('exceeds available tiles');
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it('POST /find-best should detect tile limit exceeded in AIDOORZ + QUIZ', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      try {
        const response = await request(app)
          .post('/find-best')
          .send({ rack: 'AIDOORZ', word: 'QUIZ' });

        expect(response.status).toBe(500);
        expect(response.body.error).toContain('total count');
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('Test Case 4: Invalid input - Rack exceeds 7 letters', () => {
    it('POST /find-best should reject rack with 8 letters', async () => {
      const response = await request(app)
        .post('/find-best')
        .send({ rack: 'AIDOORWZ' }); // 8 letters

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Rack must contain 1-7 letters');
    });

    it('POST /find-best should reject rack with 10 letters', async () => {
      const response = await request(app)
        .post('/find-best')
        .send({ rack: 'ABCDEFGHIJ' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Rack must contain 1-7 letters');
    });
  });

  describe('Additional API validation tests', () => {
    it('POST /find-best should reject empty rack', async () => {
      const response = await request(app)
        .post('/find-best')
        .send({ rack: '' });

      expect(response.status).toBe(400);
      // Empty string is treated as falsy, returns different error
      expect(response.body).toHaveProperty('error');
    });

    it('POST /find-best should reject missing rack field', async () => {
      const response = await request(app)
        .post('/find-best')
        .send({ word: 'ABOUT' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('GET /health should return ok status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    it('POST /find-best should accept rack with 1 letter', async () => {
      const response = await request(app)
        .post('/find-best')
        .send({ rack: 'A' });

      // May return 404 if no valid words, but should not reject for length
      expect([200, 404]).toContain(response.status);
    });

    it('POST /find-best should accept rack with exactly 7 letters', async () => {
      const response = await request(app)
        .post('/find-best')
        .send({ rack: 'ABCDEFG' });

      // May return 404 if no valid words, but should not reject for length
      expect([200, 404]).toContain(response.status);
    });
  });
});
