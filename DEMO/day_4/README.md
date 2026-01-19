# Day 4 Backend - Blockchain API

NestJS backend for reading Avalanche Smart Contract data.

## 🚀 Deployment to Railway

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Day 4 Backend for Railway deployment"
git remote add origin https://github.com/YOUR_USERNAME/day4-backend.git
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will auto-detect NestJS

### Step 3: Set Environment Variables

In Railway dashboard → Variables:

| Variable           | Value                                        |
| ------------------ | -------------------------------------------- |
| `RPC_URL`          | `https://api.avax-test.network/ext/bc/C/rpc` |
| `CONTRACT_ADDRESS` | `0x29be1a8eb7494a93470e07ed2e61cae0b4c7603b` |

> Railway automatically sets `PORT`

### Step 4: Verify Deployment

- Check Swagger docs: `https://your-app.railway.app/api`
- Test endpoint: `GET https://your-app.railway.app/blockchain/value`

---

## 📡 API Endpoints

| Method | Endpoint             | Description                       |
| ------ | -------------------- | --------------------------------- |
| GET    | `/blockchain/value`  | Get current value, message, owner |
| POST   | `/blockchain/events` | Get ValueUpdated event history    |

---

## 🔧 Local Development

```bash
npm install
npm run start:dev
```

Server runs at `http://localhost:3002`
Swagger docs at `http://localhost:3002/api`

---

Muhammad Fikri Rezandi | 231011402149
