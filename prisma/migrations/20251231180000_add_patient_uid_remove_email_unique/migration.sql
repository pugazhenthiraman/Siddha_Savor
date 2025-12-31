-- DropIndex
DROP INDEX IF EXISTS "Patient_email_key";

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "patientUID" VARCHAR(8);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Patient_patientUID_key" ON "Patient"("patientUID");

