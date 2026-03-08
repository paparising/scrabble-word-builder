# Scrabble Word Builder

Full-stack TypeScript app that returns the highest-scoring Scrabble word from a player rack and optional board word.

Quick start: see `QUICKSTART.md`.

## Features

- Best-word search (`/find-best`)
- Input validation (rack length, letter-only fields, payload shape)
- Scrabble scoring using `data/letter_data.json`
- Deterministic tie-break: alphabetical on equal score
- Dictionary loading strategy: in-memory for small files, streaming-ready for larger files
- Search optimization: precomputed in-memory dictionary entries + request result cache by available-letter signature

## Project Structure

```text
scrabble-word-builder/
|- .github/
|  `- workflows/
|     `- ci.yml
|- backend/
|  |- .env
|  |- dist/
|  |- esbuild.config.js
|  |- package.json
|  |- src/
|  |  |- __tests__/
|  |  |  |- api.test.ts
|  |  |  |- find-best.test.ts
|  |  |  |- scrabble-solver.test.ts
|  |  |  `- validation-service.api-contract.test.ts
|  |  |- errors/
|  |  |  `- validation-error.ts
|  |  |- find-best.ts
|  |  |- index.ts
|  |  |- scrabble-solver.ts
|  |  |- validation/
|  |  |  |- __tests__/
|  |  |  |  `- validation-service.test.ts
|  |  |  `- validation-service.ts
|  |- tsconfig.json
|  `- vitest.config.mts
|- data/
|  |- dictionary.txt
|  `- letter_data.json
|- frontend/
|  |- dist/
|  |- index.html
|  |- package.json
|  |- src/
|  |  |- App.css
|  |  |- App.test.tsx
|  |  |- App.tsx
|  |  |- index.css
|  |  |- main.tsx
|  |  |- services/
|  |  |  `- scrabbleApi.ts
|  |  `- test/
|  |     `- setup.ts
|  |- tsconfig.json
|  |- tsconfig.node.json
|  |- vite.config.ts
|  `- vitest.config.ts
|- images/
|- scripts/
|  `- generate-dictionary.js
|- package-lock.json
|- package.json
|- README.md
|- QUICKSTART.md
|- TEST_SUMMARY.md
|- ASSESSMENT_DEBRIEF.md
`- DEBRIEF_MOCK_QA.md
```

## Requirements

- Node.js 18+
- npm 8+

## Installation

From repo root:

```bash
npm run install:all
```

## Run

Start both services:

```bash
npm start
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5123`

Stop both:

```bash
npm run stop
```

## API

Base URL: `http://localhost:5123`

### `POST /find-best`

Request:

```json
{
  "rack": "ABOUT",
  "word": "WIZ"
}
```

Success `200`:

```json
{
  "word": "ABOUT",
  "score": 7,
  "usedLetters": {
    "A": 1,
    "B": 1,
    "O": 1,
    "U": 1,
    "T": 1
  }
}
```

Possible non-200 responses:

- `400` invalid request or invalid tile combination
- `404` no valid words found
- `500` unexpected server error

### `GET /health`

Response `200`:

```json
{
  "status": "ok"
}
```

## Validation Rules

- `rack` is required, string, `1-7` letters, `A-Z` only
- `word` is optional string, if present must be `A-Z` only
- Rack and board word are normalized (`trim` + uppercase)
- Combined tile counts cannot exceed Scrabble tile limits

## Testing

Backend tests:

```bash
cd backend
npm test -- --run
```

Current backend result: `45/45` tests passing across 5 suites.

Frontend tests:

```bash
cd frontend
npm test
```

Current frontend result: `4/4` tests passing in `frontend/src/App.test.tsx`.

## Notes

- `data/dictionary.txt` currently contains 7,877 words.
- Tie-break behavior is deterministic for repeatable results and testability.
