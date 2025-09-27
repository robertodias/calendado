/**
 * Email service using existing Resend infrastructure
 * 
 * Provides email sending functionality for invitations,
 * confirmations, and other transactional emails.
 */

import { createResendClient } from './lib/resend';
import { defineSecret } from 'firebase-functions/params';

// Define secrets
const publicAppUrl = defineSecret('PUBLIC_APP_URL');

export interface InviteEmailData {
  email: string;
  token: string;
  brandName?: string;
  inviteUrl?: string;
  expiresAt?: Date;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends an invitation email with magic link
 */
export async function sendInviteEmail(data: InviteEmailData): Promise<EmailResult> {
  try {
    const appUrl = publicAppUrl.value();
    const inviteUrl = data.inviteUrl || `${appUrl}/invite/${data.token}`;
    const brandName = data.brandName || 'Calendado';
    
    const emailHtml = generateInviteEmailHtml({
      brandName,
      inviteUrl,
      expiresAt: data.expiresAt
    });

    // Use existing ResendClient
    const resendClient = createResendClient(
      process.env.RESEND_API_KEY!,
      process.env.FROM_EMAIL!,
      process.env.FROM_NAME!
    );

    const result = await resendClient.sendEmail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // Required by ResendEmailPayload type
      to: [data.email],
      subject: `You're invited to join ${brandName}`,
      html: emailHtml,
      tags: [
        { name: 'type', value: 'invite' },
        { name: 'brand', value: brandName }
      ]
    });

    if (result.error) {
      return {
        success: false,
        error: `Resend error: ${result.error}`
      };
    }

    return {
      success: true,
      messageId: result.id
    };

  } catch (error) {
    console.error('Error sending invite email:', error);
    return {
      success: false,
      error: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Note: Waitlist confirmation emails are handled by the existing system
// in functions/src/handlers/sendWaitlistConfirmation.ts and functions/src/lib/email.ts

/**
 * Sends a password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  brandName?: string
): Promise<EmailResult> {
  try {
    const appUrl = publicAppUrl.value();
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
    const brand = brandName || 'Calendado';
    
    const emailHtml = generatePasswordResetHtml({
      brandName: brand,
      resetUrl
    });

    // Use existing ResendClient
    const resendClient = createResendClient(
      process.env.RESEND_API_KEY!,
      process.env.FROM_EMAIL!,
      process.env.FROM_NAME!
    );

    const result = await resendClient.sendEmail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // Required by ResendEmailPayload type
      to: [email],
      subject: `Reset your ${brand} password`,
      html: emailHtml,
      tags: [
        { name: 'type', value: 'password_reset' },
        { name: 'brand', value: brand }
      ]
    });

    if (result.error) {
      return {
        success: false,
        error: `Resend error: ${result.error}`
      };
    }

    return {
      success: true,
      messageId: result.id
    };

  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generates HTML for invitation email
 */
function generateInviteEmailHtml(data: {
  brandName: string;
  inviteUrl: string;
  expiresAt?: Date;
}): string {
  const expiryText = data.expiresAt 
    ? `This invitation expires on ${data.expiresAt.toLocaleDateString()} at ${data.expiresAt.toLocaleTimeString()}.`
    : 'This invitation will expire in 7 days.';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're invited to join ${data.brandName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .expiry {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            color: #92400e;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">${data.brandName}</div>
            <h1 class="title">You're invited!</h1>
        </div>
        
        <div class="content">
            <p>You've been invited to join <strong>${data.brandName}</strong> and start managing your calendar like never before.</p>
            
            <p>Click the button below to accept your invitation and create your account:</p>
            
            <div style="text-align: center;">
                <a href="${data.inviteUrl}" class="cta-button">Accept Invitation</a>
            </div>
            
            <div class="expiry">
                ⏰ ${expiryText}
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #7c3aed;">${data.inviteUrl}</p>
        </div>
        
        <div class="footer">
            <p>This invitation was sent by ${data.brandName}. If you didn't expect this email, you can safely ignore it.</p>
            <p>© ${new Date().getFullYear()} ${data.brandName}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}

// Note: Waitlist confirmation HTML is generated by the existing system
// in functions/src/lib/email.ts using i18n support

/**
 * Generates HTML for password reset email
 */
function generatePasswordResetHtml(data: {
  brandName: string;
  resetUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your ${data.brandName} password</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .warning {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            color: #dc2626;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">${data.brandName}</div>
            <h1 class="title">Reset your password</h1>
        </div>
        
        <div class="content">
            <p>We received a request to reset your password for your <strong>${data.brandName}</strong> account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
                <a href="${data.resetUrl}" class="cta-button">Reset Password</a>
            </div>
            
            <div class="warning">
                ⚠️ This link will expire in 1 hour for security reasons.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #7c3aed;">${data.resetUrl}</p>
            
            <p>If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.</p>
        </div>
        
        <div class="footer">
            <p>This email was sent by ${data.brandName}. If you didn't expect this email, you can safely ignore it.</p>
            <p>© ${new Date().getFullYear()} ${data.brandName}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}
