#!/usr/bin/env node

const http = require('http');

function testDoctorsAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/doctors',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && Array.isArray(response.data)) {
            console.log('✅ Doctors API working correctly!');
            console.log(`📊 Found ${response.data.length} doctors in database`);
            console.log('🔧 Issue resolved: Node.js compatibility fixed by downgrading Next.js from 16.0.8 to 15.1.9');
            resolve(response);
          } else {
            console.log('❌ API returned unexpected format:', response);
            reject(new Error('Unexpected API response format'));
          }
        } catch (error) {
          console.log('❌ Failed to parse API response:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Failed to connect to API:', error.message);
      console.log('💡 Make sure the Next.js server is running with: npm run dev');
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.log('❌ API request timed out');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

if (require.main === module) {
  testDoctorsAPI().catch(() => process.exit(1));
}

module.exports = testDoctorsAPI;
