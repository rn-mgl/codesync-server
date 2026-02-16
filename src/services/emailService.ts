import AppError from "@src/errors/AppError";
import axios from "axios";
import { StatusCodes } from "http-status-codes";

export const accountVerificationEmail = async (
  email: string,
  token: string,
) => {
  const url = process.env.URL;

  const body = `<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Verify Your CodeSync Account</title>

                <!-- Onest Font -->
                <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet">
                </head>

                <body style="margin:0; padding:0; background-color:#f2f2f2; font-family:'Onest', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">

                <table role="presentation" width="100%" style="border-collapse:collapse; background-color:#f2f2f2;">
                    <tr>
                    <td style="padding:40px 20px;">

                        <table role="presentation" width="100%" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 24px rgba(13,13,13,0.08);">

                        <!-- Header -->
                        <tr>
                            <td style="background-color:#0d0d0d; padding:48px 40px; text-align:center;">
                            <h1 style="margin:0; font-size:30px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">
                                CodeSync
                            </h1>
                            <p style="margin:10px 0 0; font-size:14px; color:#f2f2f2; opacity:0.85;">
                                Real-Time Collaborative Coding Platform
                            </p>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding:48px 40px; color:#0d0d0d;">

                            <h2 style="margin:0 0 18px; font-size:24px; font-weight:600; color:#0d0d0d;">
                                Verify Your Email Address
                            </h2>

                            <p style="margin:0 0 24px; font-size:16px; line-height:1.7; color:#333333;">
                                Welcome to CodeSync! We're excited to have you join a focused community of developers improving their coding skills and preparing for technical interviews.
                            </p>

                            <p style="margin:0 0 32px; font-size:16px; line-height:1.7; color:#333333;">
                                To activate your account, please confirm your email address by clicking the button below.
                            </p>

                            <!-- Button -->
                            <table role="presentation" style="margin:0 0 36px;">
                                <tr>
                                <td align="center">
                                    <a href="${url}/auth/verify/${token}"
                                    style="display:inline-block;
                                            background-color:#0d0d0d;
                                            color:#ffffff;
                                            text-decoration:none;
                                            padding:16px 44px;
                                            font-size:15px;
                                            font-weight:600;
                                            border-radius:8px;">
                                    Verify Email
                                    </a>
                                </td>
                                </tr>
                            </table>

                            <!-- Fallback link -->
                            <p style="margin:0 0 12px; font-size:14px; color:#666666;">
                                Or copy and paste this link into your browser:
                            </p>

                            <div style="background:#f2f2f2; border:1px solid #e6e6e6; border-radius:6px; padding:14px; margin-bottom:36px; word-break:break-all;">
                                <a href="${url}/auth/verify/${token}"
                                style="color:#0d0d0d; text-decoration:none; font-size:14px;">
                                ${url}/auth/verify/${token}
                                </a>
                            </div>

                            <!-- What's next -->
                            <div style="border-top:1px solid #eeeeee; padding-top:28px;">

                                <p style="margin:0 0 16px; font-size:14px; font-weight:600; color:#0d0d0d;">
                                What you can do next:
                                </p>

                                <ul style="margin:0; padding-left:18px; font-size:14px; line-height:1.9; color:#555555;">
                                <li>Practice curated coding challenges</li>
                                <li>Collaborate in real-time coding sessions</li>
                                <li>Simulate technical interviews</li>
                                <li>Pair program with other developers</li>
                                </ul>

                            </div>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background:#f2f2f2; padding:32px 40px; border-top:1px solid #e6e6e6;">

                            <p style="margin:0 0 12px; font-size:12px; line-height:1.6; color:#666666;">
                                This verification link expires in 24 hours. If you didn’t create a CodeSync account, you can safely ignore this email.
                            </p>

                            <p style="margin:0; font-size:12px; color:#666666;">
                                Need help? Contact
                                <a href="mailto:support@codesync.com" style="color:#0d0d0d; text-decoration:none; font-weight:500;">
                                support@codesync.com
                                </a>
                            </p>

                            <div style="margin-top:24px; padding-top:20px; border-top:1px solid #e6e6e6; text-align:center;">
                                <p style="margin:0; font-size:11px; color:#999999;">
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
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return data;
};
