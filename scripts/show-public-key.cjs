#!/usr/bin/env node

/**
 * Display the existing public key for WhatsApp Flow
 *
 * This script reads the existing public key and displays it in the correct format
 * for uploading to Meta Business Manager.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function formatPublicKeyForMeta(publicKey) {
  // Remove PEM headers and newlines to get the base64 string
  const base64Key = publicKey
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\n/g, '')
    .trim();

  return base64Key;
}

function main() {
  const publicKeyPath = path.join(__dirname, '..', 'keys', 'flow-public-key.pem');

  // Check if public key exists
  if (!fs.existsSync(publicKeyPath)) {
    log('\n❌ Error: Public key not found!', colors.red);
    log('\nThe public key does not exist at:', colors.yellow);
    log(`   ${publicKeyPath}`);
    log('\nPlease generate the keys first:', colors.yellow);
    log('   npm run generate-flow-keys\n', colors.bright);
    process.exit(1);
  }

  // Read the public key
  const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  const base64Key = formatPublicKeyForMeta(publicKey);

  // Display the key
  log('\n━'.repeat(60), colors.blue);
  log('📋 YOUR PUBLIC KEY FOR META BUSINESS MANAGER', colors.bright + colors.green);
  log('━'.repeat(60), colors.blue);
  log('\nCopy the key below and paste it in Meta Business Manager:', colors.yellow);
  log('━'.repeat(60), colors.blue);
  log(base64Key, colors.bright);
  log('━'.repeat(60), colors.blue);

  log('\n📍 Upload Instructions:', colors.yellow);
  log('   1. Go to: https://business.facebook.com/');
  log('   2. Navigate to: WhatsApp > Flows');
  log('   3. Select your Flow');
  log('   4. Click "Set up endpoint"');
  log('   5. Paste the key above in "Public Key" field');
  log('   6. Save the configuration');

  log('\n✅ Public key location:', colors.green);
  log(`   ${publicKeyPath}\n`);
}

// Run the script
main();
