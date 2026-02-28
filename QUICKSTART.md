# ⚡ Quick Start Guide

Get Scrabble Word Builder running in **5 minutes**!

> 📚 **Full documentation?** See [README.md](README.md) for comprehensive details.

## 🚀 Installation (Windows PowerShell)

```powershell
# 1. Navigate to the project
cd e:\development\haspro-coding\scrabble-word-builder

# 2. Install all dependencies (1-2 minutes)
npm run install:all

# 3. Build the backend
cd backend
npm run build
cd ..
```

## 🎮 Run the Application

### Start Backend & Frontend

From project root, open PowerShell and run:

```powershell
npm start
```

Then open your browser:

- 🌐 **Frontend**: http://localhost:3000
- 🔌 **API Health Check**: http://localhost:5123/health
- 🧠 **Large dictionary support**: Uses adaptive dictionary loading (memory cache for smaller files, streaming for larger files)

### Stop Backend & Frontend

From project root, run:

```powershell
npm run stop
```

Optional (stop individually):

```powershell
npm run stop:frontend
npm run stop:backend
```

## ✅ Test It's Working

1. Open http://localhost:3000 in your browser
2. Enter rack letters: `ABOUT`
3. Click "🎯 Find Best Word"
4. Should see "ABOUT" with score 7

## 🔍 Quick API Test (PowerShell)

```powershell
# Best word for rack
$body = ConvertTo-Json @{"rack"="ABOUT"}
Invoke-RestMethod -Uri http://localhost:5123/find-best -Method Post -Body $body -ContentType "application/json"

# With board word
$body = ConvertTo-Json @{"rack"="ADOORW"; "word"="IZ"}
Invoke-RestMethod -Uri http://localhost:5123/find-best -Method Post -Body $body -ContentType "application/json"
```

## 🧪 Run Tests

```powershell
cd backend
npm test
```

Should see: **27 tests passing** ✅

See [TEST_SUMMARY.md](TEST_SUMMARY.md) for details.

## ❌ Troubleshooting

| Problem                     | Solution                                              |
| --------------------------- | ----------------------------------------------------- |
| **"npm not found"**         | Install from https://nodejs.org/                      |
| **"Port 3000/5123 in use"** | Close other apps using these ports                    |
| **Need to stop both apps**  | Run `npm run stop` from project root                  |
| **"Cannot find module"**    | Run `npm run install:all` again                       |
| **Slow startup**            | First run downloads packages (normal, takes 5-10 min) |
| **Tests fail**              | Run `cd backend && npm install && npm test`           |

## 📖 Learn More

- **Full Setup Guide**: [README.md](README.md) → Installation & Setup
- **API Documentation**: [README.md](README.md) → API Endpoints
- **Validation Rules**: [README.md](README.md) → Validation Rules
- **Test Details**: [TEST_SUMMARY.md](TEST_SUMMARY.md)

## 🎯 Project File Locations

- 📦 Project Root: `e:\development\haspro-coding\scrabble-word-builder`
- 🔌 Backend: `backend/` (API server)
- 🎨 Frontend: `frontend/` (Web UI)
- 📖 Dictionary: `data/dictionary.txt` (2,280+ words)
- 💎 Scoring: `data/letter_data.json` (Scrabble values)

---

🎉 **Done!** Your Scrabble Word Builder is running. Need help? Check [README.md](README.md).

- Scrabble rules & scoring
- Development instructions
- Troubleshooting guide

---

**Stuck?** Check the console output for error messages - they usually indicate what needs fixing.
