/**
 * Newsletter Email Test Script
 * 
 * This script specifically tests the newsletter welcome email functionality
 */

require('dotenv').config({ path: '.env.local' });

// Import the email service functions
async function testNewsletterWelcomeEmail() {
  console.log('🧪 Testing Newsletter Welcome Email...');
  
  try {
    // Import the email service
    const { emailService } = await import('./src/services/email/service.js');
    
    // Test parameters
    const testParams = {
      to: 'yashdeeptandon007@gmail.com',
      name: 'Yashdeep Tandon',
      subscriberId: 'test-subscriber-id-123',
      preferences: {
        blogUpdates: true,
        projectUpdates: true,
        newsletter: true
      }
    };
    
    console.log('📧 Sending newsletter welcome email...');
    console.log('- To:', testParams.to);
    console.log('- Name:', testParams.name);
    console.log('- Subscriber ID:', testParams.subscriberId);
    
    const result = await emailService.sendNewsletterWelcome(testParams);
    
    console.log('📊 Email Result:');
    console.log('- Success:', result.success);
    console.log('- Status Code:', result.statusCode);
    console.log('- Message ID:', result.messageId);
    
    if (result.error) {
      console.error('- Error:', result.error);
    }
    
    return result.success;
    
  } catch (error) {
    console.error('❌ Error testing newsletter email:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Test the email template generation
async function testTemplateGeneration() {
  console.log('\n🧪 Testing Template Generation...');
  
  try {
    const { generateNewsletterWelcomeTemplate } = await import('./src/services/email/templates/newsletter.js');
    
    const testParams = {
      to: 'yashdeeptandon007@gmail.com',
      name: 'Yashdeep Tandon',
      subscriberId: 'test-subscriber-id-123',
      preferences: {
        blogUpdates: true,
        projectUpdates: true,
        newsletter: true
      }
    };
    
    const template = generateNewsletterWelcomeTemplate(testParams);
    
    console.log('📝 Template Generated:');
    console.log('- Subject:', template.subject);
    console.log('- HTML Length:', template.html.length, 'characters');
    console.log('- Text Length:', template.text.length, 'characters');
    
    // Check if template contains expected content
    const hasWelcome = template.html.includes('Welcome');
    const hasName = template.html.includes(testParams.name);
    const hasUnsubscribe = template.html.includes('unsubscribe');
    
    console.log('- Contains "Welcome":', hasWelcome ? '✅' : '❌');
    console.log('- Contains Name:', hasName ? '✅' : '❌');
    console.log('- Contains Unsubscribe:', hasUnsubscribe ? '✅' : '❌');
    
    return hasWelcome && hasName && hasUnsubscribe;
    
  } catch (error) {
    console.error('❌ Error testing template generation:', error.message);
    return false;
  }
}

// Test email configuration
function testEmailConfig() {
  console.log('\n🧪 Testing Email Configuration...');
  
  const config = {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL,
    fromName: process.env.FROM_NAME,
    nextAuthUrl: process.env.NEXTAUTH_URL
  };
  
  console.log('🔧 Configuration:');
  Object.entries(config).forEach(([key, value]) => {
    console.log(`- ${key}: ${value ? '✅ Set' : '❌ Missing'}`);
  });
  
  return Object.values(config).every(value => value);
}

// Main test function
async function runNewsletterTests() {
  console.log('🚀 Starting Newsletter Email Tests\n');
  
  const configOk = testEmailConfig();
  const templateOk = await testTemplateGeneration();
  const emailOk = await testNewsletterWelcomeEmail();
  
  console.log('\n📊 Test Summary:');
  console.log(`- Email Configuration: ${configOk ? '✅ OK' : '❌ Failed'}`);
  console.log(`- Template Generation: ${templateOk ? '✅ OK' : '❌ Failed'}`);
  console.log(`- Email Sending: ${emailOk ? '✅ OK' : '❌ Failed'}`);
  
  if (configOk && templateOk && emailOk) {
    console.log('\n🎉 All tests passed! Newsletter email should work correctly.');
    console.log('💡 If you still don\'t receive emails, check:');
    console.log('1. Your spam/junk folder');
    console.log('2. SendGrid activity logs');
    console.log('3. Email delivery settings in SendGrid');
  } else {
    console.log('\n❌ Some tests failed. Check the errors above.');
  }
}

// Run the tests
runNewsletterTests().catch(console.error);
