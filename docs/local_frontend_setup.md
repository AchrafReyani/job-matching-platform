# Job Matching Platform – Local Frontend Setup

This guide explains how to set up and run the **Job Matching Platform frontend** locally using **Next.js**.

---

## 1. Prerequisites

Before you start, make sure you have installed:

- [Node.js](https://nodejs.org/) (v18+ recommended)  
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)  

---

## 2. Configure Environment Variables

Create a `.env.local` file at the root of the frontend project with the following variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- `NEXT_PUBLIC_API_URL` should point to your local backend URL.  
- If you changed the backend port, update this URL accordingly to match the backend port.  

---

## 3. Install Dependencies

```bash
npm install
```

or with pnpm:

```bash
pnpm install
```

---

## 4. Start the Frontend

```bash
npm run dev
```

or with pnpm:

```bash
pnpm dev
```

By default, the frontend runs on `http://localhost:3000`.

---

## 5. Notes on Ports and Backend

- The backend runs on `http://localhost:3001` by default.  
- Make sure the frontend `.env.local` matches the backend port so API requests work correctly.  
- The backend should be running before using the frontend to ensure API calls succeed.

---

## 6. Verifying the Setup

- Open `http://localhost:3000` in your browser.  
- The frontend should load and interact with your backend endpoints as configured in `.env.local`.

This setup allows anyone to run the frontend locally with minimal configuration.

