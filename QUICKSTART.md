# Quick Start

Run the app locally on Windows PowerShell.

## 1) Install

```powershell
cd e:\development\haspro-coding\scrabble-word-builder
npm run install:all
```

## 2) Start

```powershell
npm start
```

Open:

- Frontend: `http://localhost:3000`
- API health: `http://localhost:5123/health`

## 3) Try It

Use rack `ABOUT` in the UI and submit. Expected best word is `ABOUT` with score `7`.

## 4) API Smoke Test

```powershell
$body = ConvertTo-Json @{ rack = "ABOUT" }
Invoke-RestMethod -Uri http://localhost:5123/find-best -Method Post -Body $body -ContentType "application/json"
```

## 5) Run Tests

Backend:

```powershell
cd backend
npm test -- --runInBand
```

Current backend status: `33/33` tests passing.

Frontend:

```powershell
cd ..\frontend
npm test
```

Current frontend status: `4/4` tests passing (`src/App.test.tsx`).

## 6) Stop

```powershell
cd ..
npm run stop
```

## Troubleshooting

| Problem                    | Fix                                        |
| -------------------------- | ------------------------------------------ |
| `npm` not found            | Install Node.js from `https://nodejs.org/` |
| Port `3000` or `5123` busy | Stop other processes or run `npm run stop` |
| Missing module errors      | Re-run `npm run install:all`               |

For full details, see `README.md`.
