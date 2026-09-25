import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

class MailService {
  private createTransporter = async () => {
    const clientId = process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

    const oauth2Client = new OAuth2(
      clientId,
      clientSecret,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    const accessToken = await new Promise<string>((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.error("Failed to create access token", err);
          reject("Failed to create access token");
        }
        resolve(token || "");
      });
    });

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_FROM,
        accessToken,
        clientId,
        clientSecret,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN
      }
    });
  };

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const transporter = await this.createTransporter();
    
    // In production, you would use your actual domain (e.g. process.env.NEXTAUTH_URL)
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `RecipeAI <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Reset your RecipeAI Password",
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center; background-color: #FDFBF7; color: #2B1E17; border-radius: 16px;">
          <h2 style="font-family: 'Outfit', sans-serif; color: #D95D39; font-size: 28px; margin-bottom: 16px;">RecipeAI</h2>
          <div style="background-color: #F4F0EA; padding: 32px; border-radius: 12px; margin-bottom: 24px;">
            <h3 style="font-size: 20px; margin-top: 0; margin-bottom: 16px;">Password Reset Request</h3>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">We received a request to reset your RecipeAI password. Don't worry, we've got you covered!</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #D95D39; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background-color 0.2s;">Reset Password</a>
            <p style="font-size: 14px; margin-top: 24px; color: #666;">This link will expire in 1 hour.</p>
          </div>
          <p style="font-size: 14px; color: #888;">If you didn't request a password reset, you can safely ignore this email.</p>
          <p style="font-size: 12px; color: #888; margin-top: 24px;">&copy; ${new Date().getFullYear()} RecipeAI. All rights reserved.</p>
        </div>
      `
    };

    return transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email: string, username: string) {
    const transporter = await this.createTransporter();
    const loginUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/signin`;

    const mailOptions = {
      from: `RecipeAI <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Welcome to RecipeAI! 🍳",
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center; background-color: #FDFBF7; color: #2B1E17; border-radius: 16px;">
          <h2 style="font-family: 'Outfit', sans-serif; color: #D95D39; font-size: 28px; margin-bottom: 16px;">Welcome, ${username}!</h2>
          <div style="background-color: #F4F0EA; padding: 32px; border-radius: 12px; margin-bottom: 24px;">
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">We're thrilled to have you join the RecipeAI community!</p>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Whether you're looking for quick weekday dinners or planning a feast, Chef Ada (our AI assistant) is here to help you craft the perfect meal.</p>
            <a href="${loginUrl}" style="display: inline-block; padding: 14px 28px; background-color: #D95D39; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background-color 0.2s;">Start Cooking</a>
          </div>
          <p style="font-size: 14px; color: #888;">If you have any questions, feel free to reply to this email!</p>
          <p style="font-size: 12px; color: #888; margin-top: 24px;">&copy; ${new Date().getFullYear()} RecipeAI. All rights reserved.</p>
        </div>
      `
    };

    return transporter.sendMail(mailOptions);
  }
}

export const mailService = new MailService();
