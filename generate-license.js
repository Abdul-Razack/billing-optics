const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');

function generateKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  
  fs.writeFileSync('public.pem', publicKey);
  fs.writeFileSync('private.pem', privateKey);
  console.log('✅ Generated new public.pem and private.pem keys.');
  return { publicKey, privateKey };
}

function generateLicense(hardwareId, type = 'LIFETIME', days = 365) {
  if (!fs.existsSync('private.pem')) {
    generateKeys();
  }
  
  const privateKey = fs.readFileSync('private.pem', 'utf8');
  
  const payload = {
    type,
    hardwareId,
    issuedAt: new Date().toISOString(),
  };

  if (type !== 'LIFETIME') {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    payload.expiryDate = expiryDate.toISOString();
  }
  
  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  console.log('\n--- LICENSE GENERATED ---');
  console.log(`Type: ${type}`);
  console.log(`Hardware ID: ${hardwareId}`);
  if (payload.expiryDate) console.log(`Expiry: ${payload.expiryDate}`);
  console.log('\nLICENSE STRING:\n');
  console.log(token);
  console.log('\n-------------------------\n');
  return token;
}

const args = process.argv.slice(2);

if (args.includes('--init')) {
  generateKeys();
} else if (args.includes('--generate')) {
  const hwIdIndex = args.indexOf('--hwid') + 1;
  const typeIndex = args.indexOf('--type') + 1;
  const daysIndex = args.indexOf('--days') + 1;
  
  const hardwareId = hwIdIndex > 0 && hwIdIndex < args.length ? args[hwIdIndex] : 'test-hw-id';
  const type = typeIndex > 0 && typeIndex < args.length ? args[typeIndex] : 'LIFETIME';
  const days = daysIndex > 0 && daysIndex < args.length ? parseInt(args[daysIndex], 10) : 365;
  
  generateLicense(hardwareId, type, days);
} else {
  console.log('Usage:');
  console.log('  node generate-license.js --init                               (Generates RSA keys)');
  console.log('  node generate-license.js --generate --hwid <id> --type <type> --days <num>  (Generates License)');
  console.log('    Types: LIFETIME, TRIAL, SUBSCRIPTION');
}
