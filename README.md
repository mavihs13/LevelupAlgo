# DSA Sheet Manager

DSA Sheet Manager is a full-stack app for organizing data-structures-and-algorithms practice. Create sheets and topic folders, track solved problems, save notes and resources, write custom questions, and use the built-in code editor.

## Features

- Register and log in with JWT-based authentication.
- Organize practice using personal sheets and nested folders.
- Add questions from LeetCode, GeeksforGeeks, or other platforms with difficulty, notes, and resource links.
- Track solved questions and per-folder progress.
- Pick a random question from the selected folder.
- Create custom questions with a problem statement and sample inputs/outputs.
- Write and manage reusable code snippets in the Monaco editor.
- Submit code to an optional Judge0 service for execution.
- Automatically add a **Popular DSA Questions** starter sheet for each account. It includes 25 LeetCode and GeeksforGeeks links grouped into 8 topic folders. Existing local accounts can be seeded with the command below.

## Project structure

```text
apps/
  http-server/       Express API and MongoDB-backed services
  react-app/         React + Vite frontend
packages/
  database/          Mongoose models and MongoDB connection
  types/             Shared API and data types
  eslint-config/     Shared ESLint configurations
  typescript-config/ Shared TypeScript configurations
```

## Technology

| Area | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite 8, React Router, Recoil, Tailwind CSS |
| Editor and UI | Monaco Editor, TipTap, Framer Motion, Lucide React |
| API | Node.js, Express 5, TypeScript, Axios, CORS |
| Database | MongoDB, Mongoose |
| Authentication | bcrypt password hashing, JSON Web Tokens, Nodemailer/SendGrid OTP email |
| Code execution | Judge0 API (optional) |
| Monorepo and tooling | npm workspaces, Turborepo, ESLint, Prettier |

## Prerequisites

- Node.js 20.19 or later (Node.js 22 recommended)
- npm
- MongoDB installed and running locally

On Windows, start the MongoDB service from PowerShell:

```powershell
net start MongoDB
```

The app connects to `mongodb://localhost:27017/dsa-sheet`. MongoDB creates the database and collections when the app first writes data.

## Local configuration

Create `apps/http-server/.env`:

```env
PORT=3002
MONGO_URI=mongodb://localhost:27017/dsa-sheet
JWT_SECRET=replace-with-a-long-random-secret
SENDGRID_API_KEY=
SENDGRID_EMAIL=
JUDGE0_URL=http://localhost:2358
```

Create `apps/react-app/.env`:

```env
VITE_BACKEND_URL=http://localhost:3002
```

Port `3002` is used in this local setup because another application is using `3001`. If you change the API port, update `VITE_BACKEND_URL` to match and restart Vite.

SendGrid credentials and a verified sender are needed to deliver verification emails. Judge0 is not bundled with this project; configure `JUDGE0_URL` to a reachable Judge0 instance to enable code execution.

## Install and run

Install dependencies once from the repository root:

```powershell
npm ci
```

Start the API in one terminal:

```powershell
cd apps/http-server
npm run dev
```

Start the frontend in a second terminal:

```powershell
cd apps/react-app
npx vite --port 5173
```

Open [http://localhost:5173](http://localhost:5173).

## Starter data

Newly registered accounts receive the starter DSA sheet automatically. To add it to all existing accounts in the configured local database, run from the repository root:

```powershell
npm run seed --workspace=http-server
```

Seeding is safe to rerun: existing starter sheets, folders, question links, and progress are preserved.

## Useful commands

Run these from the repository root:

```powershell
npm run build
npm run lint --workspace=react-app
```

The API build can be run on its own:

```powershell
npm run build --workspace=http-server
```

## API areas

- `/auth`: registration, login, verification, and OTP email
- `/sheet`: sheets, folders, questions, custom questions, user details, and progress data
- `/editor`: code execution and snippet management

The backend loads its `.env` from the current working directory. Running API commands from `apps/http-server` ensures its configuration is loaded.
# LevelupAlgo
