# Day 5 - Full Stack dApp (Single Vercel Deployment)

Next.js Full Stack dApp dengan API Routes untuk Avalanche blockchain.

## 🚀 Deploy ke Vercel (Gratis, Tanpa Kartu Kredit!)

### Step 1: Push ke GitHub

```bash
git add .
git commit -m "Day 5 - Full Stack dApp"
git push
```

### Step 2: Deploy di Vercel

1. Buka [vercel.com](https://vercel.com)
2. Sign up dengan GitHub (gratis)
3. Click **"Add New Project"**
4. Import repository kamu
5. Vercel otomatis detect Next.js

### Step 3: Set Environment Variables

Di Vercel dashboard → Settings → Environment Variables:

| Variable           | Value                                        |
| ------------------ | -------------------------------------------- |
| `RPC_URL`          | `https://api.avax-test.network/ext/bc/C/rpc` |
| `CONTRACT_ADDRESS` | `0x29be1a8eb7494a93470e07ed2e61cae0b4c7603b` |

### Step 4: Deploy!

Klik Deploy dan tunggu selesai 🎉

---

## ✨ Features

- 🔄 **Dual Read Mode**: Toggle Backend API vs Direct RPC
- 📝 **Write via Wallet**: Sign transactions dengan Core Wallet
- 📜 **Event History**: Lihat ValueUpdated events
- 🔄 **Auto-refresh**: Data refresh otomatis setelah transaction

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────┐
│                  VERCEL                        │
│  ┌──────────────┐    ┌──────────────────────┐ │
│  │   Frontend   │───►│     API Routes       │ │
│  │   (React)    │    │  /api/blockchain/*   │ │
│  └──────────────┘    └──────────────────────┘ │
└────────────────────────────────────────────────┘
         │                       │
         │ (wallet tx)           │ (read)
         ▼                       ▼
┌────────────────────────────────────────────────┐
│            AVALANCHE FUJI BLOCKCHAIN           │
│     Contract: 0x29be1a...7603b                │
└────────────────────────────────────────────────┘
```

---

## 📡 API Routes

| Method | Endpoint                 | Description               |
| ------ | ------------------------ | ------------------------- |
| GET    | `/api/blockchain/value`  | Get value, message, owner |
| POST   | `/api/blockchain/events` | Get event history         |

---

## 🔧 Local Development

```bash
npm install
npm run dev
```

Frontend + API routes di `http://localhost:3000`

---

Muhammad Fikri Rezandi | 231011402149
