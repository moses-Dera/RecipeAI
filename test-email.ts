import { mailService } from './src/lib/modules/mail/mail.service';
import { config } from 'dotenv';
config(); // Load .env file

async function test() {
  console.log("Sending test email...");
  try {
    await mailService.sendPasswordResetEmail("okonkwomoses158@gmail.com", "test-token-123");
    console.log("Success! Email sent.");
  } catch (err) {
    console.error("Failed to send email:");
    console.error(err);
  }
}

test();
