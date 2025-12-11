import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { env } from "../lib/env";

// Use standard pg Pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 5, // Smaller pool for seed script
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // =====================
    // ADMIN CREDENTIALS
    // =====================
    const adminEmail = env.ADMIN_EMAIL;
    const adminPassword = env.ADMIN_PASSWORD;

    if (!adminPassword || adminPassword.length < 8) {
      throw new Error(
        "ADMIN_PASSWORD must be at least 8 characters long. Please set it in your .env file."
      );
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.admin.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword, // Update password if admin exists
      },
      create: {
        email: adminEmail,
        password: hashedPassword,
      },
    });

    console.log("✅ Admin seeded:", {
      id: admin.id,
      email: admin.email,
      createdAt: admin.createdAt,
    });
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n🌱 Seed completed successfully!");
  })
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
