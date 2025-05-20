# 🦊 NoteFox

**NoteFox** is a modern, full-stack note-taking platform built with **Next.js** and **TypeScript**, integrated with **Stripe** for payment handling, **Supabase** for authentication and storage, and **Prisma** for database access.

This app provides users a secure, fast, and scalable environment to write, manage, and store their notes with premium subscription features.

---

## 🚀 Features

- 🔐 User authentication via Supabase
- 📝 Create, read, update, and delete notes
- 💳 Stripe integration for paid subscriptions
- 🌙 Dark mode support
- ⚡ Server-side rendering (SSR) with Next.js
- 🛠️ Type-safe backend with Prisma and TypeScript

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes, TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Auth & Storage**: Supabase
- **Payments**: Stripe
- **ORM**: Prisma
- **Language**: TypeScript

---

## 📦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Jayesh-JainX/NoteFox
cd notefox
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Set Up Environment Variables
Create a .env file in the root with the following:

env
```bash
KINDE_CLIENT_ID=YOUR_KINDE_CLIENT_ID
KINDE_CLIENT_SECRET=YOUR_KINDE_CLIENT_SECRET
KINDE_ISSUER_URL=YOUR_KINDE_ISSUER_URL
KINDE_SITE_URL=YOUR_KINDE_SITE_URL
KINDE_POST_LOGOUT_REDIRECT_URL=YOUR_KINDE_POST_LOGOUT_REDIRECT_URL
KINDE_POST_LOGIN_REDIRECT_URL=YOUR_KINDE_POST_LOGIN_REDIRECT_URL

DATABASE_URL=YOUR_DATABASE_URL

STRIPE_KEY=YOUR_STRIPE_KEY

PRICE_ID=YOUR_PRICE_ID

PRODUCTION_URL=YOUR_PRODUCTION_URL

STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET
```

## 4. Set Up the Database
Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

## 5. Generate Prisma client:

```bash
npx prisma generate
```

## 6. Run the Dev Server

```bash
npm run dev
```

Go to http://localhost:3000
