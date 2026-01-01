-- CreateEnum
CREATE TYPE "DoctorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InviteRole" AS ENUM ('DOCTOR', 'PATIENT');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "smtpConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" SERIAL NOT NULL,
    "doctorUID" VARCHAR(8),
    "email" TEXT NOT NULL,
    "password" TEXT,
    "status" "DoctorStatus" NOT NULL DEFAULT 'PENDING',
    "formData" JSONB NOT NULL,
    "inviteToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "patientUID" VARCHAR(8),
    "email" TEXT NOT NULL,
    "password" TEXT,
    "formData" JSONB NOT NULL,
    "inviteToken" TEXT,
    "doctorUID" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientVitals" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "doctorUID" TEXT NOT NULL,
    "pulseRate" INTEGER,
    "heartRate" INTEGER,
    "temperature" DOUBLE PRECISION,
    "bloodPressureSystolic" INTEGER,
    "bloodPressureDiastolic" INTEGER,
    "respiratoryRate" INTEGER,
    "oxygenSaturation" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "height" INTEGER,
    "bmi" DOUBLE PRECISION,
    "bmr" DOUBLE PRECISION,
    "tdee" DOUBLE PRECISION,
    "assessmentType" TEXT,
    "medicines" JSONB,
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientVitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteLink" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "role" "InviteRole" NOT NULL,
    "doctorUID" TEXT,
    "createdBy" TEXT NOT NULL DEFAULT 'ADMIN',
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_doctorUID_key" ON "Doctor"("doctorUID");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_inviteToken_key" ON "Doctor"("inviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_patientUID_key" ON "Patient"("patientUID");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_inviteToken_key" ON "Patient"("inviteToken");

-- CreateIndex
CREATE INDEX "PatientVitals_patientId_idx" ON "PatientVitals"("patientId");

-- CreateIndex
CREATE INDEX "PatientVitals_doctorUID_idx" ON "PatientVitals"("doctorUID");

-- CreateIndex
CREATE UNIQUE INDEX "InviteLink_token_key" ON "InviteLink"("token");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_doctorUID_fkey" FOREIGN KEY ("doctorUID") REFERENCES "Doctor"("doctorUID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientVitals" ADD CONSTRAINT "PatientVitals_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientVitals" ADD CONSTRAINT "PatientVitals_doctorUID_fkey" FOREIGN KEY ("doctorUID") REFERENCES "Doctor"("doctorUID") ON DELETE RESTRICT ON UPDATE CASCADE;
