import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_PM1myou5zhZp@ep-summer-bread-ad0a52d0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export async function query(text: string, params?: any[]) {
  const client = new Client({ 
    connectionString,
    connectionTimeoutMillis: 15000, // 15 second connection timeout
    query_timeout: 10000, // 10 second query timeout
  });
  
  try {
    await client.connect();
    const result = await client.query(text, params);
    return result;
  } finally {
    await client.end();
  }
}

export async function getAdmin() {
  const result = await query('SELECT * FROM "Admin" LIMIT 1');
  return result.rows[0] || null;
}

export async function getAdminByEmail(email: string) {
  const result = await query('SELECT * FROM "Admin" WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function updateAdminSmtpConfig(adminId: number, smtpConfig: any) {
  await query(
    'UPDATE "Admin" SET "smtpConfig" = $1 WHERE id = $2',
    [JSON.stringify(smtpConfig), adminId]
  );
}

export async function getSmtpConfig() {
  const result = await query('SELECT "smtpConfig" FROM "Admin" LIMIT 1');
  return result.rows[0]?.smtpConfig || null;
}
