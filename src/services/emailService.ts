import AppError from "@src/errors/AppError";
import axios from "axios";
import { StatusCodes } from "http-status-codes";

export const accountVerificationEmail = async (
  email: string,
  token: string
) => {
  const url = process.env.URL;

  const body = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your CodeSync Account</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
                        <tr>
                            <td style="padding: 40px 20px;">
                                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="background-color: #000000; padding: 40px 40px 30px; text-align: center;">
                                            <h1 style="margin: 0; color: #14b8a6; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                                CodeSync
                                            </h1>
                                            <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                                                Real-Time Collaborative Coding Platform
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px;">
                                            <h2 style="margin: 0 0 16px; color: #000000; font-size: 24px; font-weight: 600;">
                                                Verify Your Email Address
                                            </h2>
                                            
                                            <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                                                Welcome to CodeSync! We're excited to have you join our community of developers preparing for technical interviews and improving their coding skills.
                                            </p>
                                            
                                            <p style="margin: 0 0 32px; color: #333333; font-size: 16px; line-height: 1.6;">
                                                To get started, please verify your email address by clicking the button below:
                                            </p>
                                            
                                            <!-- Verification Button -->
                                            <table role="presentation" style="margin: 0 0 32px;">
                                                <tr>
                                                    <td style="text-align: center;">
                                                        <a href="${url}/auth/verify/${token}" style="display: inline-block; background-color: #14b8a6; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 6px; font-size: 16px; font-weight: 600; transition: background-color 0.2s;">
                                                            Verify Email Address
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <p style="margin: 0 0 16px; color: #666666; font-size: 14px; line-height: 1.6;">
                                                Or copy and paste this link into your browser:
                                            </p>
                                            
                                            <div style="background-color: #f8f8f8; border: 1px solid #e5e5e5; border-radius: 4px; padding: 12px; margin: 0 0 32px; word-break: break-all;">
                                                <a href="${url}/auth/verify/${token}" style="color: #14b8a6; text-decoration: none; font-size: 14px;">
                                                    ${url}/auth/verify/${token}
                                                </a>
                                            </div>
                                            
                                            <div style="border-top: 1px solid #e5e5e5; padding-top: 24px; margin-top: 24px;">
                                                <p style="margin: 0 0 16px; color: #666666; font-size: 14px; line-height: 1.6;">
                                                    <strong style="color: #000000;">What's next?</strong>
                                                </p>
                                                <ul style="margin: 0; padding: 0 0 0 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                                                    <li>Practice coding problems from our extensive library</li>
                                                    <li>Join real-time collaborative coding sessions</li>
                                                    <li>Prepare for technical interviews with mock sessions</li>
                                                    <li>Connect with other developers and pair program</li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #f8f8f8; padding: 32px 40px; border-top: 1px solid #e5e5e5;">
                                            <p style="margin: 0 0 8px; color: #666666; font-size: 12px; line-height: 1.6;">
                                                This verification link will expire in 24 hours. If you didn't create a CodeSync account, you can safely ignore this email.
                                            </p>
                                            <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.6;">
                                                Need help? Contact us at <a href="mailto:support@codesync.com" style="color: #14b8a6; text-decoration: none;">support@codesync.com</a>
                                            </p>
                                            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e5e5; text-align: center;">
                                                <p style="margin: 0; color: #999999; font-size: 11px;">
                                                    © 2024 CodeSync. All rights reserved.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>`;

  const envelope = {
    to: email,
    subject: "Account Verification",
    html: body,
    source: process.env.EMAIL_SOURCE,
  };

  const data = await axios.post(`${process.env.EMAIL_CONNECTOR}`, {
    envelope,
  });

  if (!data) {
    throw new AppError(
      `An error occurred when sending the account verification email`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return data;
};
