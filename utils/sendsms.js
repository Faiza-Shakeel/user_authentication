const twilio = require("twilio");

// Create a Twilio client using credentials
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Function to send SMS
async function sendSMS(to, body) {
  await client.messages.create({
    body: body,                  // message text
    from: process.env.TWILIO_PHONE,  // your Twilio phone number
    to: to,                      // recipient phone number
  });
  console.log("SMS sent successfully!");
}

// Example usage
sendSMS("+923001234567", "Your OTP is 123456");
