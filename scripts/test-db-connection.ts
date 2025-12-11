import "dotenv/config";
import { env } from "../lib/env";
import { Pool } from "pg";

async function testConnection() {
  let pool: Pool | null = null;
  
  try {
    console.log("🔍 Testing database connection...\n");
    
    // Check if DATABASE_URL is set
    const dbUrl = env.DATABASE_URL;
    if (!dbUrl) {
      console.error("❌ DATABASE_URL is not set!");
      console.error("💡 Create a .env file with DATABASE_URL");
      process.exit(1);
    }
    
    // Mask password in URL for display
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");
    console.log(`📡 Database URL: ${maskedUrl}\n`);
    
    // Create a simple connection pool with longer timeout
    pool = new Pool({
      connectionString: dbUrl,
      max: 1,
      connectionTimeoutMillis: 10000, // 10 seconds
      idleTimeoutMillis: 30000,
    });

    console.log("⏳ Attempting to connect (timeout: 10s)...");
    
    // Test 1: Simple connection test
    const client = await pool.connect();
    console.log("✅ Database connection established!");

    // Test 2: Query database version (simple query)
    try {
      const versionResult = await client.query("SELECT version()");
      const version = versionResult.rows[0]?.version || "Unknown";
      console.log(`✅ Database query successful!`);
      console.log(`📊 PostgreSQL Version: ${version.split(",")[0]}\n`);
    } catch (queryError) {
      console.log("⚠️  Could not query database version");
    }

    // Test 3: Check if database exists and get current database name
    try {
      const dbResult = await client.query("SELECT current_database()");
      const dbName = dbResult.rows[0]?.current_database || "Unknown";
      console.log(`📦 Current database: ${dbName}`);
    } catch (error) {
      console.log("⚠️  Could not get database name");
    }

    // Test 4: Check if tables exist
    try {
      const tablesResult = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);
      
      if (tablesResult.rows.length > 0) {
        console.log(`\n📋 Available tables (${tablesResult.rows.length}):`);
        tablesResult.rows.forEach((row) => {
          console.log(`   - ${row.tablename}`);
        });
      } else {
        console.log("\n⚠️  No tables found in 'public' schema");
        console.log("💡 Run migrations: npx prisma migrate dev");
      }
    } catch (error) {
      console.log("\n⚠️  Could not list tables (might need migrations)");
    }

    // Test 5: Count admin records (if table exists)
    try {
      const adminResult = await client.query("SELECT COUNT(*) as count FROM \"Admin\"");
      const adminCount = adminResult.rows[0]?.count || 0;
      console.log(`\n👤 Admin records: ${adminCount}`);
      if (adminCount === 0) {
        console.log("💡 Run seed: npx prisma db seed");
      }
    } catch (error) {
      console.log("\n⚠️  Admin table not found (run migrations first)");
    }

    client.release();
    console.log("\n✅ All connection tests passed!");
    
  } catch (error) {
    console.error("\n❌ Database connection failed!");
    
    if (error instanceof Error) {
      console.error(`\nError: ${error.message}`);
      
      if (error.message.includes("timeout")) {
        console.error("\n💡 Connection timeout - Possible issues:");
        console.error("   - PostgreSQL server is not running");
        console.error("   - DATABASE_URL host/port is incorrect");
        console.error("   - Firewall blocking the connection");
        console.error("   - Database server is too slow to respond");
      } else if (error.message.includes("ENOTFOUND") || error.message.includes("ECONNREFUSED")) {
        console.error("\n💡 Connection refused - Possible issues:");
        console.error("   - PostgreSQL server is not running");
        console.error("   - Wrong host or port in DATABASE_URL");
        console.error("   - Check if PostgreSQL is listening on the correct port");
      } else if (error.message.includes("password") || error.message.includes("authentication")) {
        console.error("\n💡 Authentication failed - Possible issues:");
        console.error("   - Wrong username or password in DATABASE_URL");
        console.error("   - User doesn't have permission to access the database");
      } else if (error.message.includes("does not exist")) {
        console.error("\n💡 Database doesn't exist:");
        console.error("   - Create the database first");
        console.error("   - Or update DATABASE_URL with correct database name");
      }
    }
    
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log("\n🔌 Disconnected from database");
    }
  }
}

testConnection();

