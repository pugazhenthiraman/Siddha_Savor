# Siddha Savor

A Next.js application for managing doctors and patients with authentication and invite system.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4
- **Authentication**: bcrypt for password hashing
- **Linting**: ESLint with Next.js config

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm, yarn, pnpm, or bun

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/siddha_savor?schema=public"
NODE_ENV="development"
ADMIN_EMAIL="admin@siddhasavor.com"
ADMIN_PASSWORD="YourSecurePassword123"
```

**Important**: Change `ADMIN_PASSWORD` to a strong password in production!

### 3. Database Setup

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Seed Database

Seed the database with initial admin user:

```bash
npm run prisma:seed
# or
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
siddha_savor/
├── app/              # Next.js App Router pages
├── lib/              # Utility functions
│   ├── db.ts        # Prisma client singleton
│   └── env.ts       # Environment variable validation
├── prisma/          # Prisma schema and migrations
│   ├── schema.prisma
│   └── seed.ts
└── public/          # Static assets
```

## Database Models

- **Admin**: System administrators
- **Doctor**: Medical practitioners with approval workflow
- **Patient**: Patient records linked to doctors
- **InviteLink**: Invitation system for doctors and patients

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)

## Environment Variables

All environment variables are validated at startup. See `.env.example` for required variables.

## Security Notes

- Passwords are hashed using bcrypt
- Environment variables are validated before use
- Admin credentials should be changed in production
- Never commit `.env` files to version control

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
