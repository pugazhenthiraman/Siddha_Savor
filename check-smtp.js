// Check SMTP configuration script
const { query } = require('./lib/db.ts');

const checkSmtpConfig = async () => {
  try {
    const result = await query('SELECT "smtpConfig" FROM "Admin" LIMIT 1');
    const config = result.rows[0]?.smtpConfig;
    
    console.log('SMTP Config:', config);
    
    if (!config) {
      console.log('❌ No SMTP configuration found');
      return;
    }
    
    if (!config.isActive) {
      console.log('❌ SMTP is configured but not active');
      return;
    }
    
    console.log('✅ SMTP is configured and active');
    console.log('Host:', config.host);
    console.log('Port:', config.port);
    console.log('From Email:', config.fromEmail);
    
  } catch (error) {
    console.error('Error checking SMTP:', error);
  }
};

checkSmtpConfig();
