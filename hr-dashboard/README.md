# TeamPulse — Real-Time Employee & HR Management Dashboard

A MERN app with live employee status, task time-tracking, chat, notifications,
and attendance — all updated in real time via Socket.io.

## Folder structure

```
hr-dashboard/
├── server/     ← Node + Express + MongoDB + Socket.io (API)
└── client/     ← React + Redux Toolkit (UI)
```

You run **two servers at once**, in two separate terminals: backend on port
5000, frontend on port 5173. Don't use the "Live Server" VS Code extension —
that only serves static HTML and cannot run this backend.

## 1. Backend setup

Open a terminal **inside the `server` folder**:

```bash
cd hr-dashboard/server
npm install
```

Copy `.env.example` to `.env` and fill in real values:

```
MONGO_URI=your MongoDB Atlas connection string
JWT_SECRET=any long random string
PORT=5000
CLIENT_URL=http://localhost:5173
```

Start it:

```bash
npm run dev
```

You should see `Server running on port 5000` and `MongoDB connected`.
Visit `http://localhost:5000` in a browser — it should say
"HR Dashboard API is running".

## 2. Frontend setup

Open a **second, separate terminal** inside the `client` folder:

```bash
cd hr-dashboard/client
npm install
```

Copy `.env.example` to `.env` (defaults already point at localhost:5000, so
usually no changes needed).

Start it:

```bash
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

## 3. Using the app

1. Go to `/register`, create one account with role **HR** and one with role
   **Employee** (open a second browser/incognito window for the second one).
2. Log in as HR → you'll see the live team status list and can assign tasks.
3. Log in as Employee → you'll see assigned tasks, can Start/Pause/Complete
   them (time is tracked automatically), and chat with HR under Messages.
4. Everything updates live without refreshing: online/offline dot, task
   status, and chat.

## If something goes wrong

- **"cd: no such file or directory"** → you're not inside the right folder.
  Run `pwd` (or `cd` with no argument on Windows) to see where you are, and
  `dir` / `ls` to see what's actually there, then `cd` into the correct path
  step by step.
- **MongoDB connection error** → check `MONGO_URI` in `server/.env`, and that
  your IP is allow-listed in MongoDB Atlas (Network Access → Add IP → Allow
  from anywhere, for local dev).
- **CORS or socket errors in the browser console** → make sure `CLIENT_URL`
  in `server/.env` matches the URL the frontend is actually running on.
