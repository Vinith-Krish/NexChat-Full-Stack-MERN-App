# NexChat Client

React + Vite frontend for NexChat.

## Run Locally

```bash
npm install
npm run dev
```

## Environment

Create a `.env` file in this folder:

```env
VITE_BACKEND_URL=http://localhost:5001
```

## Production Notes

- Deploy this folder to Vercel.
- Point `VITE_BACKEND_URL` at the live backend URL.
- The app uses cookie-based auth, so the backend must allow the frontend origin in CORS.
