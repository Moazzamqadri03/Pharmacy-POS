# Peerzada Medicate Duroo — Pharmacy POS & Billing System

> **Drug License No: Br-05-413/415**  
> Sopore, District Baramulla, Kashmir

A full-stack pharmacy management system built with **Next.js 14**, **Prisma ORM**, and **Neon (free PostgreSQL)**.

---

## 🗂 Project Structure

```
peerzada-medicate/
├── prisma/
│   ├── schema.prisma        ← Database schema
│   └── seed.js              ← Sample medicine data
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── medicines/   ← CRUD API for medicines
│   │   │   ├── sales/       ← Save sales + reduce stock
│   │   │   └── dashboard/   ← Stats API
│   │   ├── pos/             ← POS / Billing page
│   │   ├── inventory/       ← Inventory management
│   │   ├── sales/           ← Sales history
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Receipt.tsx      ← Printable receipt (DL no. always shown)
│   │   └── Toast.tsx
│   └── lib/
│       ├── prisma.ts        ← DB client singleton
│       ├── constants.ts     ← Store info
│       └── types.ts
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## ⚡ Features

- 🛒 **POS Billing** — Add medicines to cart, apply discount, auto-calculate CGST/SGST
- 🖨 **Printable Receipts** — Drug License No always on every receipt
- 💊 **Inventory Management** — Add, edit, delete medicines with stock tracking
- 📋 **Sales History** — View all past transactions with full item breakdown
- 🏠 **Dashboard** — Today's revenue, low stock alerts, recent sales
- 🗄️ **PostgreSQL Database** — All data persisted via Neon (free tier)
- 📦 **GST Compliant** — CGST/SGST split, GST inclusive in MRP

---

## 🚀 Deployment Guide

### Step 1 — Get Free Database (Neon)

1. Go to [https://neon.tech](https://neon.tech) and sign up (free)
2. Click **"New Project"**, name it `peerzada-medicate`
3. Choose region closest to you (Mumbai preferred for Kashmir)
4. Click **"Create Project"**
5. Copy the connection string — looks like:
   ```
   postgresql://user:password@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

---

### Step 2 — Set Up Locally

```bash
# 1. Open the folder in VS Code
cd peerzada-medicate

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env.local

# 4. Paste your Neon connection string in .env.local
# Edit .env.local and replace the DATABASE_URL value

# 5. Push schema to database
npm run db:push

# 6. Seed with sample medicines
npm run db:seed

# 7. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

### Step 3 — Push to GitHub

```bash
# Initialize git (in the project folder)
git init
git add .
git commit -m "Initial commit — Peerzada Medicate Duroo POS"

# Create a new repo on github.com (name: peerzada-medicate)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/peerzada-medicate.git
git branch -M main
git push -u origin main
```

---

### Step 4 — Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select your `peerzada-medicate` repository
4. In **Environment Variables**, add:
   - `DATABASE_URL` = your Neon connection string
   - `NEXT_PUBLIC_GSTIN` = your actual GSTIN number
5. Click **"Deploy"**

Vercel will auto-deploy on every `git push` to `main`.

---

### Step 5 — Update GSTIN

Once you have your actual GSTIN, update it in `.env.local` (local) and in Vercel dashboard under Project Settings → Environment Variables.

---

## 🔧 Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Build for production |
| `npm run db:push` | Push schema changes to DB |
| `npm run db:studio` | Open Prisma Studio (visual DB viewer) |
| `npm run db:seed` | Seed sample medicines |

---

## 📜 Compliance

Every generated receipt prominently displays:
- **Drug License No: Br-05-413/415** (top of receipt, below store name)
- CGST + SGST breakdown (intra-state GST)
- License number repeated in receipt footer

---

*Built for Peerzada Medicate Duroo, Sopore, Baramulla, Kashmir*
