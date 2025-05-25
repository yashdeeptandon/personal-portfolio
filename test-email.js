/**
 * Email Service Test Script
 * 
 * This script tests the email service functionality to help debug
 * newsletter subscription email issues.
 */

require('dotenv').config({ path: '.env.local' });

// Test SendGrid API directly
async function testSendGridAPI() {
  console.log('🧪 Testing SendGrid API...');
  
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;
  const fromName = process.env.FROM_NAME;
  
  console.log('📧 Email Config:');
  console.log('- API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
  console.log('- From Email:', fromEmail || 'NOT SET');
  console.log('- From Name:', fromName || 'NOT SET');
  
  if (!apiKey || !fromEmail) {
    console.error('❌ Missing required email configuration');
    return false;
  }
  
  const payload = {
    personalizations: [{
      to: [{ email: 'yashdeeptandon007@gmail.com' }]
    }],
    from: {
      email: fromEmail,
      name: fromName
    },
    subject: 'Test Email from Portfolio App',
    content: [{
      type: 'text/plain',
      value: 'This is a test email to verify SendGrid configuration.'
    }, {
      type: 'text/html',
      value: '<p>This is a <strong>test email</strong> to verify SendGrid configuration.</p>'
    }]
  };
  
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📡 SendGrid Response Status:', response.status);
    
    if (response.ok) {
      console.log('✅ SendGrid API test successful!');
      console.log('📬 Test email should be delivered shortly');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ SendGrid API error:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }
}

// Test email validation
function testEmailValidation() {
  console.log('\n🧪 Testing email validation...');
  
  const testEmails = [
    'yashdeeptandon007@gmail.com',
    'invalid-email',
    'test@example.com',
    ''
  ];
  
  testEmails.forEach(email => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    console.log(`📧 ${email || '(empty)'}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  });
}

// Test environment variables
function testEnvironmentVariables() {
  console.log('\n🧪 Testing environment variables...');
  
  const requiredVars = [
    'SENDGRID_API_KEY',
    'FROM_EMAIL',
    'FROM_NAME',
    'NEXTAUTH_URL',
    'MONGODB_URI'
  ];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`🔧 ${varName}: ${value ? '✅ Set' : '❌ Missing'}`);
  });
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Email Service Tests\n');
  
  testEnvironmentVariables();
  testEmailValidation();
  
  const sendGridWorking = await testSendGridAPI();
  
  console.log('\n📊 Test Summary:');
  console.log(`- SendGrid API: ${sendGridWorking ? '✅ Working' : '❌ Failed'}`);
  
  if (sendGridWorking) {
    console.log('\n💡 Next steps:');
    console.log('1. Check your email inbox (including spam folder)');
    console.log('2. If you received the test email, the issue might be in the newsletter template');
    console.log('3. Try running the newsletter subscription again');
  } else {
    console.log('\n💡 Troubleshooting:');
    console.log('1. Verify your SendGrid API key is correct');
    console.log('2. Check if your SendGrid account is active');
    console.log('3. Ensure your from email is verified in SendGrid');
    console.log('4. Check SendGrid activity logs for more details');
  }
}

// Run the tests
runTests().catch(console.error);
