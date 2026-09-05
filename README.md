# SpendWise AI Pro — Local Development Version

Competition-ready personal finance assistant that runs **without MongoDB** during local development.

## Stack
React + Vite | Node.js + Express | local JSON storage | JWT | Gemini AI (optional) | Tesseract OCR | Recharts

## Backend
```bash
cd server
npm install
copy .env.example .env
npm run dev
```

The backend stores users, expenses and budgets in `server/data/db.json`, created automatically on first run. No MongoDB is required.

Set `JWT_SECRET` in `.env`. Add `GEMINI_API_KEY` for real AI insights. Without it, the app uses a local fallback.

## Frontend
```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Features
- JWT signup/login
- Expense CRUD
- Category/date/search filters
- Monthly dashboard and charts
- Budget creation and progress
- Gemini-powered financial insights (optional)
- Local fallback insights
- Receipt OCR in browser with Tesseract.js
- CSV export

## MongoDB later
The current version intentionally uses local JSON storage so development can continue without MongoDB. MongoDB can be added later with a storage adapter/migration when you are ready.
