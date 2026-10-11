import { google } from 'googleapis';

class MailService {
  private getGmailClient() {
    const clientId = process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error(
        "Missing Gmail OAuth credentials. Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN are set in .env"
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      process.env.GOOGLE_REDIRECT_URI || "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
  }

  private encodeMessage(to: string, from: string, subject: string, html: string): string {
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      `From: ${from}`,
      `Subject: ${utf8Subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      html
    ];
    const message = messageParts.join('\r\n');

    // Gmail API v1 requires URL-safe base64 string
    return Buffer.from(message).toString('base64url');
  }

  async sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
    const gmail = this.getGmailClient();
    const fromAddress = process.env.EMAIL_FROM || 'me';
    const fromHeader = `Cravely <${fromAddress}>`;

    const raw = this.encodeMessage(to, fromHeader, subject, html);

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw
      }
    });

    return response.data;
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center; background-color: #FDFBF7; color: #2B1E17; border-radius: 16px;">
        <h2 style="font-family: 'Outfit', sans-serif; color: #D95D39; font-size: 28px; margin-bottom: 16px;">Cravely</h2>
        <div style="background-color: #F4F0EA; padding: 32px; border-radius: 12px; margin-bottom: 24px;">
          <h3 style="font-size: 20px; margin-top: 0; margin-bottom: 16px;">Password Reset Request</h3>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">We received a request to reset your Cravely password. Don't worry, we've got you covered!</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #D95D39; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background-color 0.2s;">Reset Password</a>
          <p style="font-size: 14px; margin-top: 24px; color: #666;">This link will expire in 1 hour.</p>
        </div>
        <p style="font-size: 14px; color: #888;">If you didn't request a password reset, you can safely ignore this email.</p>
        <p style="font-size: 12px; color: #888; margin-top: 24px;">&copy; ${new Date().getFullYear()} Cravely. All rights reserved.</p>
      </div>
    `;

    return this.sendMail({
      to: email,
      subject: "Reset your Cravely Password",
      html
    });
  }

  async sendWelcomeEmail(email: string, username: string) {
    const loginUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/signin`;

    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center; background-color: #FDFBF7; color: #2B1E17; border-radius: 16px;">
        <h2 style="font-family: 'Outfit', sans-serif; color: #D95D39; font-size: 28px; margin-bottom: 16px;">Welcome, ${username}!</h2>
        <div style="background-color: #F4F0EA; padding: 32px; border-radius: 12px; margin-bottom: 24px;">
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">We're thrilled to have you join the Cravely community!</p>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Whether you're looking for quick weekday dinners or planning a feast, Chef Cravely (our AI assistant) is here to help you craft the perfect meal.</p>
          <a href="${loginUrl}" style="display: inline-block; padding: 14px 28px; background-color: #D95D39; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background-color 0.2s;">Start Cooking</a>
        </div>
        <p style="font-size: 14px; color: #888;">If you have any questions, feel free to reply to this email!</p>
        <p style="font-size: 12px; color: #888; margin-top: 24px;">&copy; ${new Date().getFullYear()} Cravely. All rights reserved.</p>
      </div>
    `;

    return this.sendMail({
      to: email,
      subject: "Welcome to Cravely! 🍳",
      html
    });
  }
}

export const mailService = new MailService();
