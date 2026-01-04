-- Add diagnosis field and remove height and bmi fields
ALTER TABLE "PatientVitals" ADD COLUMN "diagnosis" TEXT;
ALTER TABLE "PatientVitals" DROP COLUMN IF EXISTS "height";
ALTER TABLE "PatientVitals" DROP COLUMN IF EXISTS "bmi";
