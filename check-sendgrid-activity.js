/**
 * SendGrid Activity Checker
 * 
 * This script checks recent SendGrid email activity to see if emails were sent
 */

require('dotenv').config({ path: '.env.local' });

async function checkSendGridActivity() {
  console.log('🔍 Checking SendGrid Activity...');
  
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.error('❌ SendGrid API key not found');
    return;
  }
  
  try {
    // Get recent email activity (last 24 hours)
    const response = await fetch('https://api.sendgrid.com/v3/messages?limit=10', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Failed to fetch SendGrid activity:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    
    console.log('📊 Recent SendGrid Activity:');
    console.log(`- Total messages found: ${data.messages?.length || 0}`);
    
    if (data.messages && data.messages.length > 0) {
      data.messages.forEach((message, index) => {
        console.log(`\n📧 Message ${index + 1}:`);
        console.log(`- Message ID: ${message.msg_id}`);
        console.log(`- To: ${message.to_email}`);
        console.log(`- Subject: ${message.subject}`);
        console.log(`- Status: ${message.status}`);
        console.log(`- Timestamp: ${message.last_event_time}`);
        
        if (message.events && message.events.length > 0) {
          console.log(`- Events:`);
          message.events.forEach(event => {
            console.log(`  - ${event.event_name}: ${event.processed}`);
          });
        }
      });
    } else {
      console.log('📭 No recent messages found');
    }
    
  } catch (error) {
    console.error('❌ Error checking SendGrid activity:', error.message);
  }
}

// Alternative: Check email events for a specific email
async function checkEmailEvents(email = 'yashdeeptandon007@gmail.com') {
  console.log(`\n🔍 Checking events for ${email}...`);
  
  const apiKey = process.env.SENDGRID_API_KEY;
  
  try {
    const response = await fetch(`https://api.sendgrid.com/v3/messages?to_email=${email}&limit=5`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Failed to fetch email events:', response.status);
      return;
    }
    
    const data = await response.json();
    
    if (data.messages && data.messages.length > 0) {
      console.log(`✅ Found ${data.messages.length} messages to ${email}:`);
      data.messages.forEach((message, index) => {
        console.log(`\n📧 Message ${index + 1}:`);
        console.log(`- Subject: ${message.subject}`);
        console.log(`- Status: ${message.status}`);
        console.log(`- Last Event: ${message.last_event_time}`);
      });
    } else {
      console.log(`📭 No messages found for ${email}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking email events:', error.message);
  }
}

// Run the checks
async function runChecks() {
  await checkSendGridActivity();
  await checkEmailEvents();
  
  console.log('\n💡 Troubleshooting Tips:');
  console.log('1. If messages show "delivered" but you don\'t see them, check spam folder');
  console.log('2. If messages show "bounced", the email address might be invalid');
  console.log('3. If no messages are found, the newsletter email might not be sending');
  console.log('4. Check SendGrid dashboard at https://app.sendgrid.com for more details');
}

runChecks().catch(console.error);
