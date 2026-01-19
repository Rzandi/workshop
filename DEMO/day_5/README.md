# Day 5 Frontend - Full Stack dApp

Next.js frontend integrated with Backend API for Avalanche dApp.

## 🚀 Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Day 5 Frontend for Vercel deployment"
git remote add origin https://github.com/YOUR_USERNAME/day5-frontend.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### Step 3: Set Environment Variables

In Vercel dashboard → Settings → Environment Variables:

| Variable                       | Value                                        |
| ------------------------------ | -------------------------------------------- |
| `NEXT_PUBLIC_BACKEND_URL`      | `https://your-backend.railway.app`           |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0x29be1a8eb7494a93470e07ed2e61cae0b4c7603b` |

> ⚠️ Replace `your-backend.railway.app` with your actual Railway backend URL!

### Step 4: Redeploy

After setting environment variables, trigger a redeploy.

---

## ✨ Features

- 🔄 **Dual Read Mode**: Toggle between Backend API and Direct RPC
- 📝 **Write via Wallet**: Sign transactions with Core Wallet
- 📜 **Event History**: View ValueUpdated events with block range
- 🔄 **Auto-refresh**: Data refreshes after transaction confirmation

---

## 🔧 Local Development

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

Make sure backend is running at `http://localhost:3002`

---

## 🏗️ Architecture

```
User → Frontend (Vercel) → Backend (Railway) → Blockchain (Avalanche)
         ↓
       Wallet → Blockchain (direct for transactions)
```

---

Muhammad Fikri Rezandi | 231011402149
