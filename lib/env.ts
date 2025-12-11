/**
 * Environment variable validation and access
 * Ensures all required environment variables are present at runtime
 */

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvOptional(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const env = {
  // Database
  DATABASE_URL: getEnv("DATABASE_URL"),

  // Node Environment
  NODE_ENV: getEnvOptional("NODE_ENV", "development"),

  // Admin credentials (for seeding)
  ADMIN_EMAIL: getEnvOptional("ADMIN_EMAIL", "admin@siddhasavor.com"),
  ADMIN_PASSWORD: getEnvOptional("ADMIN_PASSWORD", "Admin@123"),

  // Helper
  isDevelopment: () => env.NODE_ENV === "development",
  isProduction: () => env.NODE_ENV === "production",
} as const;

