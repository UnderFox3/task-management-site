import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createVerificationTokenInD1 } from '@/lib/db';
import {
  createVerificationUrl,
  getEmailAppUrl,
  getVerificationEmailSettings,
  isDevelopmentEmailMode,
  isDummyEmail,
  sendVerificationEmail,
} from '@/lib/email-verification';

const RESEND_COOLDOWN_MS = 60 * 1000;



export async function POST(request: Request) {
  console.log("SEND VERIFICATION REQUEST RECEIVED");

  let body: { userId?: unknown };
  
  try {
    body = await request.json() as { userId?: unknown };
    console.log("SEND VERIFICATION BODY:", body);
  } catch {
    return NextResponse.json(
      { success: false, message: 'A valid JSON request body is required.' },
      { status: 400 },
    );
  }

  if (typeof body.userId !== 'string' || !body.userId.trim()) {
    return NextResponse.json(
      { success: false, message: 'A user ID is required.' },
      { status: 400 },
    );
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const user = await env.DB.prepare(
      'SELECT id, email, username, email_verified FROM users WHERE id = ?',
    )
      .bind(body.userId)
      .first<{
        id: string;
        email: string;
        username: string;
        email_verified: number;
      }>();

    console.log("USER LOOKUP RESULT:",
      {
        userId: user?.id,
        found: !!user,
        email: user?.email,
        username: user?.username,
        email_verified: user?.email_verified,
      }
    );
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Account not found.' },
        { status: 404 },
      );
    }

    if (user.email_verified === 1) {
      return NextResponse.json(
        { success: false, message: 'This email address is already verified.' },
        { status: 409 },
      );
    }

    if (isDummyEmail(user.email) && !isDevelopmentEmailMode(request.url)) {
      return NextResponse.json(
        { success: false, message: 'Verification emails are disabled for demo email addresses.' },
        { status: 400 },
      );
    }

    const settings = getVerificationEmailSettings(env);
    const appUrl = getEmailAppUrl(request, settings.appUrl);
    console.log("VERIFICATION EMAIL SETTINGS:", {
      apiKeyExists: Boolean(settings.apiKey),
      appUrl,
      from: settings.from
    });
    if (!appUrl) {
      return NextResponse.json(
        { success: false, message: 'Email verification is not configured on this server.' },
        { status: 503 },
      );
    }

    const recentToken = await env.DB.prepare(
      'SELECT created_at FROM verification_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    )
      .bind(user.id)
      .first<{ created_at: string }>();
    if (recentToken && Date.now() - Date.parse(recentToken.created_at) < RESEND_COOLDOWN_MS) {
      return NextResponse.json(
        { success: false, message: 'Please wait a minute before requesting another verification email.' },
        { status: 429 },
      );
    }

    const token = await createVerificationTokenInD1(env.DB, user.id);
    const verificationUrl = createVerificationUrl(appUrl, token);
    try {
      const emailSent = await sendVerificationEmail(
        settings.apiKey,
        settings.from,
        user.email,
        user.username,
        verificationUrl,
      );
      return NextResponse.json({
        success: true,
        message: emailSent
          ? `A verification email was sent to ${user.email}.`
          : 'The development verification link was printed to the server console.',
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return NextResponse.json(
        { success: false, 
          message: 'Unable to send the verification email right now. Please try again later.',
          error: error instanceof Error ? error.message : String(error) },
        { status: 502 },
      );
    }

  } catch (error) {
    console.error('Verification email request failed:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to process the verification email request.' },
      { status: 500 },
    );
  }
}