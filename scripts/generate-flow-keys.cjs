#!/usr/bin/env node

/**
 * Generate RSA Key Pair for WhatsApp Flow Encryption
 *
 * This script generates a public/private key pair required for WhatsApp Flows.
 * The public key is uploaded to Meta Business Manager, and the private key
 * is used to decrypt incoming Flow data.
 *
 * Based on: https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint#upload_public_key
 */

const crypto = require('crypto');
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

function generateKeyPair() {
  log('\n🔐 Generating RSA Key Pair for WhatsApp Flow...', colors.bright);
  log('━'.repeat(60), colors.blue);

  // Generate RSA key pair (2048-bit as required by Meta)
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return { publicKey, privateKey };
}

function saveKeys(publicKey, privateKey) {
  const keysDir = path.join(__dirname, '..', 'keys');

  // Create keys directory if it doesn't exist
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
    log(`\n📁 Created directory: ${keysDir}`, colors.green);
  }

  // Save private key
  const privateKeyPath = path.join(keysDir, 'flow-private-key.pem');
  fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 }); // Restricted permissions
  log(`✅ Private key saved to: ${privateKeyPath}`, colors.green);

  // Save public key
  const publicKeyPath = path.join(keysDir, 'flow-public-key.pem');
  fs.writeFileSync(publicKeyPath, publicKey);
  log(`✅ Public key saved to: ${publicKeyPath}`, colors.green);

  return { publicKeyPath, privateKeyPath };
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

function displayInstructions(publicKey, publicKeyPath) {
  const base64Key = formatPublicKeyForMeta(publicKey);

  log('\n━'.repeat(60), colors.blue);
  log('✅ KEY GENERATION COMPLETE!', colors.bright + colors.green);
  log('━'.repeat(60), colors.blue);

  log('\n📋 NEXT STEPS:', colors.bright + colors.yellow);
  log('\n1️⃣  Copy the public key below:', colors.yellow);
  log('━'.repeat(60), colors.blue);
  log(base64Key, colors.bright);
  log('━'.repeat(60), colors.blue);

  log('\n2️⃣  Upload to Meta Business Manager:', colors.yellow);
  log('   • Go to: https://business.facebook.com/');
  log('   • Navigate to: WhatsApp > Flows');
  log('   • Select your Flow');
  log('   • Click "Set up endpoint"');
  log('   • Paste the public key above in the "Public Key" field');
  log('   • Save the configuration');

  log('\n3️⃣  Add private key path to your .env:', colors.yellow);
  log(`   FLOW_PRIVATE_KEY_PATH=${publicKeyPath.replace('public', 'private')}`, colors.bright);

  log('\n⚠️  SECURITY WARNINGS:', colors.red);
  log('   • NEVER commit the private key to git');
  log('   • Add /keys/ to your .gitignore');
  log('   • Keep the private key secure and backed up');
  log('   • The private key is required to decrypt Flow data');

  log('\n📄 Public key also saved to:', colors.green);
  log(`   ${publicKeyPath}`);

  log('\n━'.repeat(60), colors.blue);
}

function updateGitignore() {
  const gitignorePath = path.join(__dirname, '..', '.gitignore');

  try {
    let gitignoreContent = '';
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    // Check if keys directory is already ignored
    if (!gitignoreContent.includes('/keys/') && !gitignoreContent.includes('keys/')) {
      const keysIgnoreEntry = '\n# WhatsApp Flow encryption keys (NEVER commit these!)\n/keys/\n*.pem\n';
      fs.appendFileSync(gitignorePath, keysIgnoreEntry);
      log('\n✅ Added /keys/ to .gitignore', colors.green);
    } else {
      log('\n✓ .gitignore already contains keys exclusion', colors.green);
    }
  } catch (error) {
    log(`\n⚠️  Warning: Could not update .gitignore: ${error.message}`, colors.yellow);
  }
}

function main() {
  try {
    // Generate key pair
    const { publicKey, privateKey } = generateKeyPair();

    // Save keys to files
    const { publicKeyPath, privateKeyPath } = saveKeys(publicKey, privateKey);

    // Update .gitignore
    updateGitignore();

    // Display instructions
    displayInstructions(publicKey, publicKeyPath);

    log('\n✨ Done! Follow the steps above to complete the setup.\n', colors.bright + colors.green);
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main();
