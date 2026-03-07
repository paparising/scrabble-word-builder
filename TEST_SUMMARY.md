# Scrabble Word Builder - Test Suite Summary

Date verified: 2026-03-06

## Overview

This document summarizes the current automated test coverage.

- Backend: Jest (`backend/src/__tests__`, `backend/src/validation/__tests__`)
- Frontend: Vitest (`frontend/src`)

## Current Results

### Backend

- Status: all passing
- Test suites: 5
- Tests: 43 passing, 0 failing
- Command: `cd backend && npm test -- --runInBand`

### Frontend

- Status: all passing
- Test file: `frontend/src/App.test.tsx`
- Command: `cd frontend && npm test`
- Tests: 4 passing, 0 failing

## Backend Suite Breakdown

- `backend/src/__tests__/scrabble-solver.test.ts`
  - Best-word search for rack-only inputs
  - Rack + board-word combination behavior
  - Combined tile-limit violations
  - Case-insensitivity and edge cases
  - Deterministic tie-breaking (`ACT` vs `CAT`)

- `backend/src/__tests__/api.test.ts`
  - `POST /find-best` success cases
  - `POST /find-best` invalid payload and invalid tile combinations
  - `GET /health` health check
  - Correct status handling (`200`, `400`, `404`)

- `backend/src/__tests__/validation-service.test.ts`
  - Input normalization (`trim` + uppercase)
  - Required field checks
  - Rack length checks
  - Letter-only checks for `rack` and `word`
  - Strict schema behavior (unexpected keys)

- `backend/src/validation/__tests__/find-best.test.ts`
  - Direct schema-level parsing and normalization checks
  - Rack and board-word validation failure assertions

- `backend/src/validation/__tests__/validation-service.test.ts`
  - Unit checks for helper methods (`countLetters`, `validateCombinedLetters`, `buildAvailableLetters`)
  - Validation error behavior for tile-limit overuse

## Important Contract Notes

- Supported API routes are currently:
  - `POST /find-best`
  - `GET /health`
- There is no `POST /find-top` route in the current implementation.

## Run Commands

Backend:

```bash
cd backend
npm test -- --runInBand
```

Frontend:

```bash
cd frontend
npm test
```

## Conclusion

Both suites are green: backend `43/43` and frontend `4/4`.
