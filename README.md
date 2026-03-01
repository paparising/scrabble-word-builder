# 🎮 Scrabble Word Builder

A full-stack web application that generates the highest scoring valid word based on specified inputs, emulating simplified Scrabble mechanics.

## 🚀 Quick Start

**Want to get running in 5 minutes?** → Check [QUICKSTART.md](QUICKSTART.md)

## Features

✨ **Find Best Word**: Quickly identify the highest scoring valid word for your rack  
🎯 **Smart Validation**: Checks dictionary, tile limits, and letter availability  
💎 **Scrabble Scoring**: Uses authentic Scrabble point values for each letter  
🌐 **Web-Based**: Clean, responsive UI for desktop and mobile devices  
⚡ **Fast Performance**: Efficient algorithm for word generation and validation  
✅ **Fully Tested**: 27 comprehensive tests covering all features  
🔄 **CI/CD Pipeline**: Automated testing with GitHub Actions

## 📸 Screenshot

![Scrabble Word Builder App](images/app-screenshot.png)

_Example: Finding the best word "WIZARD" (19 points) from rack "AIDOORW" with board word "WIZ"_

## Project Structure

```
scrabble-word-builder/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── index.ts           # Main Express server
│   │   ├── scrabble-solver.ts # Core Scrabble logic
│   │   └── __tests__/         # Jest test files
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React web application
│   ├── src/
│   │   ├── App.tsx            # Main React component
│   │   ├── App.css            # Styling
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── data/
│   ├── dictionary.txt         # 7,877 English words
│   └── letter_data.json       # Letter scores and tile counts
├── images/
│   └── app-screenshot.png     # Application screenshot
├── .github/
│   └── workflows/
│       └── ci.yml             # CI/CD pipeline
├── README.md                  # This file
├── QUICKSTART.md              # Quick setup guide
└── TEST_SUMMARY.md            # Comprehensive test documentation
```

## Requirements

- **Node.js**: v16 or higher
- **npm**: v8 or higher

## Installation & Setup

### 1. Install Dependencies

Navigate to the project root and install all dependencies:

```bash
cd scrabble-word-builder

# Install all dependencies
npm run install:all
```

Or install separately:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Build Backend

```bash
cd backend
npm run build
```

### 3. (Optional) Verify Setup

```bash
# Check Node version
node --version

# Check npm version
npm --version
```

## Running the Application

### Option 1: Run Both Backend & Frontend Together

From the project root:

```bash
npm start
```

This will start:

- **Backend API**: http://localhost:5123
- **Frontend**: http://localhost:3000

### Option 2: Run Backend & Frontend Separately

**Terminal 1 - Backend:**

```bash
npm run start:backend
```

**Terminal 2 - Frontend:**

```bash
npm run start:frontend
```

### Option 3: Development Mode

**Terminal 1 - Backend (with auto-reload):**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (with Vite):**

```bash
cd frontend
npm run start
```

## Stopping the Application

From the project root, stop both services:

```bash
npm run stop
```

Stop individually if needed:

```bash
npm run stop:frontend
npm run stop:backend
```

## Usage

1. **Open the Web App**
   - Navigate to http://localhost:3000 in your browser

2. **Enter Your Rack**
   - Type 1-7 letters from your player rack
   - Letters are automatically converted to uppercase

3. **Optional: Board Word**
   - If building upon an existing word on the board, enter it
   - This ensures letter counts don't exceed available tiles
   - Letters can appear in both rack and board word, as long as the combined total doesn't exceed available tiles

4. **Find Best Word**
   - Click "🎯 Find Best Word" to get the highest scoring single word
   - Results show the word, score, and letters used

## API Endpoints

Base URL: `http://localhost:5123`

### POST /find-best

Find the highest scoring valid word.

**Request Body:**

```json
{
  "rack": "LETTERS",
  "word": "OPTIONAL_BOARD_WORD"
}
```

**Successful Response (200):**

```json
{
  "word": "FOUND_WORD",
  "score": 25,
  "usedLetters": {
    "F": 1,
    "O": 1,
    "U": 1,
    "R": 1
  }
}
```

**Error Response (400/500):**

```json
{
  "error": "Error message describing the issue"
}
```

### GET /health

Check API health status.

**Response (200):**

```json
{
  "status": "ok"
}
```

## Data Files

### letter_data.json

Contains Scrabble letter values and tile counts:

```json
{
  "letters": {
    "A": { "score": 1, "tiles": 9 },
    "B": { "score": 3, "tiles": 2 }
  }
}
```

### dictionary.txt

One valid English word per line (**7,877 words total**):

```
ABOUT
ABOVE
ABUSE
...
```

#### Dictionary Word Count by Letter

| Letter | Words | Letter | Words | Letter | Words |
| ------ | ----- | ------ | ----- | ------ | ----- |
| A      | 299   | J      | 65    | S      | 952   |
| B      | 248   | K      | 50    | T      | 535   |
| C      | 483   | L      | 247   | U      | 110   |
| D      | 305   | M      | 314   | V      | 163   |
| E      | 285   | N      | 149   | W      | 273   |
| F      | 287   | O      | 162   | X      | 281   |
| G      | 171   | P      | 585   | Y      | 427   |
| H      | 206   | Q      | 32    | Z      | 533   |
| I      | 248   | R      | 467   |        |       |

## Validation Rules

### ✅ Rack Validation

- **Length**: Must contain 1-7 letters (Scrabble standard)
- **Empty**: Cannot be empty
- **Letters**: Only alphabetic characters allowed

### ✅ Board Word Validation

- **Optional**: Can be provided to build upon existing board words
- **Combined Tiles**: Rack and board word letters combined cannot exceed tile limits

### ✅ Word Validation

- **Length**: Must be 2-15 letters long
- **Dictionary**: Must exist in the dictionary
- **Formable**: Must be formed from available letters in rack
- **Tie-breaker**: If scores are equal, the alphabetically first word is returned

### ✅ Tile Limits

- Total usage of each letter cannot exceed Scrabble tile availability
- Standard Scrabble: 9 A's, 2 B's, 1 Q, 1 Z, etc.
- Each letter can only be used as many times as there are tiles

### ❌ Rejected Cases

1. **Rack exceeds 7 letters**: `"AIDOORWZ"` → Error
2. **Combined tiles exceed limit**: Rack `"AIDOORZ"` + Word `"QUIZ"` (combined Z's exceed 1 available) → Error
3. **Tile exceeding limit**: Using more of any letter than available tiles → Error

## Scoring System

Follows standard Scrabble point values:

| Letter | Points | Tiles | Letter | Points | Tiles |
| ------ | ------ | ----- | ------ | ------ | ----- |
| A      | 1      | 9     | N      | 1      | 6     |
| B      | 3      | 2     | O      | 1      | 8     |
| C      | 3      | 2     | P      | 3      | 2     |
| D      | 2      | 4     | Q      | 10     | 1     |
| E      | 1      | 12    | R      | 1      | 6     |
| F      | 4      | 2     | S      | 1      | 4     |
| G      | 2      | 3     | T      | 1      | 6     |
| H      | 4      | 2     | U      | 1      | 4     |
| I      | 1      | 9     | V      | 4      | 2     |
| J      | 8      | 1     | W      | 4      | 2     |
| K      | 5      | 1     | X      | 8      | 1     |
| L      | 1      | 4     | Y      | 4      | 2     |
| M      | 3      | 2     | Z      | 10     | 1     |

## Testing

The application includes a comprehensive test suite with 27 tests covering all features:

### Run Tests

```bash
cd backend
npm test
```

### Test Coverage

- ✅ **Case 1**: Valid single rack input
- ✅ **Case 2**: Valid rack + non-overlapping board word
- ✅ **Case 3**: Invalid input - overlapping tiles detection
- ✅ **Case 4**: Invalid input - rack exceeds 7 letters
- ✅ **Additional**: Edge cases, boundary conditions, API validation

For detailed test information, see [TEST_SUMMARY.md](TEST_SUMMARY.md)

## CI/CD Pipeline

The project includes a GitHub Actions workflow for continuous integration:

### Automated Checks

| Job              | Description                                      |
| ---------------- | ------------------------------------------------ |
| **Build & Test** | Builds both backend and frontend, runs all tests |
| **Code Quality** | TypeScript type checking for both projects       |

### Triggers

- ✅ Push to `master` or `main` branch
- ✅ Pull requests to `master` or `main` branch

### Pipeline Steps

1. Install dependencies (backend & frontend)
2. Build TypeScript projects
3. Run Jest test suite with coverage
4. Verify data files exist (`dictionary.txt`, `letter_data.json`)
5. TypeScript compilation checks

### Troubleshooting

- **Cache path errors**: The workflow previously attempted to cache using `cache-dependency-path` entries for `backend/package-lock.json` and `frontend/package-lock.json`. If those files are missing, `setup-node` emits the shown error. The CI configuration was updated to stop specifying dependency paths (cache still works by default). To fix manually either add lockfiles or remove the `cache-dependency-path` lines, as shown in the updated workflow.
- **Build failures**: Confirm both `backend` and `frontend` scripts (`npm run build`) work locally. The pipeline mirrors root commands with `working-directory` set.
- **Port conflicts**: Backend tests start a server; make sure no process occupies port `5123` on the runner (should not happen on GitHub-hosted runners).

### Status Badge

Add this badge to show CI status:

```markdown
![CI](https://github.com/YOUR_USERNAME/scrabble-word-builder/actions/workflows/ci.yml/badge.svg)
```

## Development

### Environment Configuration

Backend `.env` supports:

- `DICTIONARY_PATH` - dictionary file path
- `LETTER_DATA_PATH` - letter data file path
- `PORT` - backend API port
- `MAX_CACHED_DICTIONARY_BYTES` - dictionary size threshold for in-memory caching; files above this are streamed from disk

### Building for Production

**Backend:**

```bash
cd backend
npm run build
```

**Frontend:**

```bash
cd frontend
npm run build
```

Build artifacts:

- Backend: `backend/dist/`
- Frontend: `frontend/dist/`

### Technology Stack

**Backend:**

- Node.js
- TypeScript
- Express.js
- CORS middleware
- Jest (testing)

**Frontend:**

- React 18
- TypeScript
- Vite (bundler)
- CSS3 for styling

### Code Quality

All code is written in TypeScript with strict type checking:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

## Troubleshooting

### "Cannot find module" errors

**Solution:**

```bash
# Ensure all dependencies are installed
npm run install:all

# Clear node_modules and reinstall
rm -rf backend/node_modules frontend/node_modules
npm run install:all
```

### Port already in use (5123 or 3000)

**Solution:**

Change the port in environment or config:

```bash
# Backend on different port
PORT=5001 npm run start:backend

# Frontend - edit frontend/vite.config.ts
```

### Dictionary file not found

**Solution:**

- Ensure `data/dictionary.txt` exists in project root
- Verify correct file path in backend code
- Check file has read permissions

### CORS errors in browser console

**Solution:**

- Ensure backend is running on port 5123
- Verify frontend vite.config.ts proxy settings point to 5123
- Check backend is started before frontend

### Tests failing

**Solution:**

```bash
cd backend
# Ensure dependencies are installed
npm install
# Run tests
npm test
```

## Performance Notes

- **Dictionary Size**: 7,877 words for comprehensive coverage
- **Word Search**: Scans dictionary words directly against available letters
- **Search Optimization**: Adaptive dictionary source
  - Caches in memory for smaller dictionaries
  - Streams from disk in chunks for larger dictionaries
- **Response Time**: Typically <100ms for finding best word
- **Memory**: Bounded dictionary memory usage, scales better for large dictionary files

## Future Enhancements

🔮 **Potential Features:**

- Blank tile support (wildcards)
- Bonus square multipliers (2x/3x letter/word)
- Cross-word validation
- Game history tracking
- Multiplayer support
- Word hint suggestions
- Letter exchange functionality
- Undo/redo moves
- AI opponent

## License

This project is provided as-is for educational purposes.

## Author

Created as a Scrabble Word Builder challenge solution in 2026.

---

**Need help?** Check the API responses for detailed error messages. See [QUICKSTART.md](QUICKSTART.md) for common setup issues.
