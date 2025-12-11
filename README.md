# Siddha Savor - Healthcare Management System

A modern healthcare management platform built with Next.js 16, TypeScript, and PostgreSQL.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4
- **Authentication**: bcrypt password hashing
- **Validation**: Zod schemas

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Admin dashboard
│   ├── login/            # Login page
│   └── page.tsx          # Homepage
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   └── ui/               # UI components
├── lib/                  # Core utilities
│   ├── constants/        # App constants
│   ├── hooks/           # Custom hooks
│   ├── services/        # API services
│   └── validations/     # Zod schemas
└── prisma/              # Database schema & seeds
```

## 🛠️ Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Update DATABASE_URL and other variables
   ```

3. **Database setup**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## 🔐 Default Admin Credentials

- **Email**: admin@siddhasavor.com
- **Password**: Admin@123

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data

## 🏗️ Architecture

- **Service Layer**: Centralized API calls and business logic
- **Error Handling**: Consistent error management across the app
- **Type Safety**: Full TypeScript coverage with Zod validation
- **Component-Based**: Reusable UI components with proper separation

## 🔒 Security Features

- Password hashing with bcrypt
- Input validation with Zod
- SQL injection protection with Prisma
- Environment variable validation
- Secure session management

---

Built with ❤️ for modern healthcare management
