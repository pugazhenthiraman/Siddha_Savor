-- AlterTable
ALTER TABLE "PatientVitals" ADD COLUMN     "naadi" TEXT,
ADD COLUMN     "randomBloodSugar" INTEGER,
ADD COLUMN     "thegi" TEXT;

-- CreateTable
CREATE TABLE "MealStatus" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mealType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDietPlan" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "planData" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDietPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealStatus_patientId_idx" ON "MealStatus"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "MealStatus_patientId_date_mealType_key" ON "MealStatus"("patientId", "date", "mealType");

-- CreateIndex
CREATE UNIQUE INDEX "CustomDietPlan_patientId_key" ON "CustomDietPlan"("patientId");

-- AddForeignKey
ALTER TABLE "MealStatus" ADD CONSTRAINT "MealStatus_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDietPlan" ADD CONSTRAINT "CustomDietPlan_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
