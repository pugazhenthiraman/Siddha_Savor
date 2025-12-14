-- Add SMTP configuration as JSON field to Admin table
ALTER TABLE "Admin" ADD COLUMN "smtpConfig" JSONB;
