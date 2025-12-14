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
const prisma = new PrismaClient();

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

    // =====================
    // TEST DOCTORS
    // =====================
    const testDoctors = [
      {
        email: "dr.smith@example.com",
        password: await bcrypt.hash("Doctor@123", 10),
        status: "PENDING" as const,
        formData: {
          firstName: "John",
          lastName: "Smith",
          specialization: "Cardiology",
          experience: 10,
          licenseNumber: "MD12345",
          phone: "+1-555-0101",
          education: "Harvard Medical School",
          hospital: "City General Hospital",
          bio: "Experienced cardiologist with 10+ years in practice"
        }
      },
      {
        email: "dr.johnson@example.com",
        password: await bcrypt.hash("Doctor@123", 10),
        status: "APPROVED" as const,
        doctorUID: "DOC001",
        formData: {
          firstName: "Sarah",
          lastName: "Johnson",
          specialization: "Pediatrics",
          experience: 8,
          licenseNumber: "MD67890",
          phone: "+1-555-0102",
          education: "Johns Hopkins University",
          hospital: "Children's Medical Center",
          bio: "Dedicated pediatrician specializing in child healthcare"
        }
      },
      {
        email: "dr.williams@example.com",
        password: await bcrypt.hash("Doctor@123", 10),
        status: "PENDING" as const,
        formData: {
          firstName: "Michael",
          lastName: "Williams",
          specialization: "Orthopedics",
          experience: 15,
          licenseNumber: "MD11111",
          phone: "+1-555-0103",
          education: "Stanford Medical School",
          hospital: "Orthopedic Specialists",
          bio: "Orthopedic surgeon with expertise in sports medicine"
        }
      }
    ];

    for (const doctorData of testDoctors) {
      await prisma.doctor.upsert({
        where: { email: doctorData.email },
        update: doctorData,
        create: doctorData,
      });
    }

    console.log("✅ Test doctors seeded");

    // =====================
    // TEST PATIENTS
    // =====================
    const testPatients = [
      {
        email: "patient1@example.com",
        password: await bcrypt.hash("Patient@123", 10),
        doctorUID: "DOC001",
        formData: {
          firstName: "Alice",
          lastName: "Brown",
          age: 35,
          phone: "+1-555-0201",
          address: "123 Main St, City, State",
          emergencyContact: "Bob Brown - +1-555-0202",
          medicalHistory: "No significant medical history"
        }
      },
      {
        email: "patient2@example.com",
        password: await bcrypt.hash("Patient@123", 10),
        doctorUID: "DOC001",
        formData: {
          firstName: "David",
          lastName: "Wilson",
          age: 42,
          phone: "+1-555-0203",
          address: "456 Oak Ave, City, State",
          emergencyContact: "Mary Wilson - +1-555-0204",
          medicalHistory: "Diabetes Type 2, managed with medication"
        }
      }
    ];

    for (const patientData of testPatients) {
      await prisma.patient.upsert({
        where: { email: patientData.email },
        update: patientData,
        create: patientData,
      });
    }

    console.log("✅ Test patients seeded");

    // =====================
    // TEST INVITE LINKS
    // =====================
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    await prisma.inviteLink.upsert({
      where: { token: "sample-doctor-invite-token" },
      update: {
        role: "DOCTOR",
        expiresAt: futureDate,
      },
      create: {
        token: "sample-doctor-invite-token",
        role: "DOCTOR",
        expiresAt: futureDate,
      },
    });

    console.log("✅ Test invite links seeded");

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
