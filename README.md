# Code Zen

AI-powered website generator with a live workspace. The frontend provides a landing flow and an interactive workspace, while the backend uses Claude to choose a project template and generate responses.

# Live Link
[https://code-zen.onrender.com]

## Features
- Prompt-driven website generation
- Live workspace with editor, file explorer, and preview
- Template selection (React or Node) via LLM
- Modern UI with dark mode support

## Tech Stack
- Frontend: React, Vite, TypeScript, Tailwind CSS, Radix UI
- Backend: Node.js, Express, TypeScript, Groq SDK

## Project Structure
```
code-zen/
  backend/      # Express + Groq sdk integration
  frontend/     # React + Vite app
```

## Prerequisites
- Node.js 18+ (recommended)
- npm or pnpm

## Environment Variables
Create the following files:

`backend/.env`
```
GROQ_API_KEY=your_groq_api_key
MODEL=name_of_the_model (default:[meta-llama/llama-4-scout-17b-16e-instruct])
```


## Install & Run

### Backend
```
cd backend
npm install
npm run dev
```
Runs on `http://localhost:3000`.

### Frontend
```
cd frontend
npm install
npm run dev
```
Vite will print the local URL (usually `http://localhost:5173`).

## API Endpoints

`POST /template`
- Body: `{ "prompt": "..." }`
- Returns prompts used by the UI based on the selected template.

`POST /chat`
- Body: `{ "messages": [{ "role": "user", "content": "..." }] }`
- Returns a Ai-generated response string.

## Scripts

Backend:
- `npm run dev` — build TypeScript and start the server

Frontend:
- `npm run dev` — start Vite dev server
- `npm run build` — build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview production build

## Notes
- The backend requires a valid Groq API key in `backend/.env`.
