/**
 * Script de test pour vérifier que le webhook fonctionne
 */

const NGROK_URL = 'https://dilatory-keiko-dendrological.ngrok-free.dev';

console.log('🧪 Testing webhook endpoints...\n');

// Test 1: Health check
console.log('1️⃣ Testing health endpoint...');
fetch(`${NGROK_URL}/health`)
  .then(res => res.json())
  .then(data => {
    console.log('✅ Health check passed:', data);
  })
  .catch(err => {
    console.error('❌ Health check failed:', err.message);
  });

// Test 2: Webhook verification (simule Meta)
console.log('\n2️⃣ Testing webhook verification...');
const verifyParams = new URLSearchParams({
  'hub.mode': 'subscribe',
  'hub.verify_token': 'hsf_verification_token_here',
  'hub.challenge': 'test_challenge_123'
});

fetch(`${NGROK_URL}/webhook/whatsapp?${verifyParams}`)
  .then(res => res.text())
  .then(data => {
    if (data === 'test_challenge_123') {
      console.log('✅ Webhook verification passed!');
    } else {
      console.log('❌ Webhook verification failed. Response:', data);
    }
  })
  .catch(err => {
    console.error('❌ Webhook verification request failed:', err.message);
  });

// Test 3: Simule un message WhatsApp
console.log('\n3️⃣ Testing webhook message handling...');
const testMessage = {
  object: 'whatsapp_business_account',
  entry: [{
    id: 'test_entry',
    changes: [{
      value: {
        messaging_product: 'whatsapp',
        metadata: {
          display_phone_number: '15550000000',
          phone_number_id: '777613572112627'
        },
        messages: [{
          from: '33612345678',
          id: 'test_msg_123',
          timestamp: Date.now().toString(),
          type: 'text',
          text: {
            body: 'Hello from test script'
          }
        }]
      },
      field: 'messages'
    }]
  }]
};

setTimeout(() => {
  fetch(`${NGROK_URL}/webhook/whatsapp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testMessage)
  })
    .then(res => {
      console.log('✅ Webhook POST request sent. Status:', res.status);
      console.log('📝 Check your server logs to see if the message was processed!');
    })
    .catch(err => {
      console.error('❌ Webhook POST request failed:', err.message);
    });
}, 2000);
