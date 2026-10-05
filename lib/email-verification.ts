import { Resend } from 'resend';

export function isDummyEmail(email: string): boolean {
  const dummyDomains = [
    'example.com',
    'example.org',
    'example.net',
    'test.com',
    'dummy.com',
    'fake.com',
    'itask.local',
    'localhost',
    'mailinator.com',
    'tempmail.com',
  ];
  const parts = email.toLowerCase().split('@');
  if (parts.length !== 2) return true;
  const domain = parts[1];
  return dummyDomains.some((dummyDomain) =>
    domain === dummyDomain || domain.endsWith(`.${dummyDomain}`)
  ) || !domain.includes('.');
}

export function getVerificationEmailSettings(env: CloudflareEnv) {
  return {
    apiKey: env.RESEND_API_KEY || process.env.RESEND_API_KEY,
    appUrl: env.APP_URL || process.env.APP_URL,
    from: env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL ||
      'Task Manager <onboarding@resend.dev>',
  };
}

export function createVerificationUrl(appUrl: string, token: string): string {
  const baseUrl = new URL(appUrl);
  if (
    (baseUrl.protocol !== 'https:' && baseUrl.hostname !== 'localhost' && baseUrl.hostname !== '127.0.0.1') ||
    baseUrl.username ||
    baseUrl.password
  ) {
    throw new Error('APP_URL must be an HTTPS URL without embedded credentials.');
  }

  const verificationUrl = new URL('/verify', baseUrl);
  verificationUrl.searchParams.set('token', token);
  return verificationUrl.toString();
}

export async function sendVerificationEmail(
  apiKey: string,
  from: string,
  to: string,
  username: string,
  verificationUrl: string,
): Promise<void> {
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to,
    subject: 'Verify your Task Manager email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin: auto;">
        <h2 style="color: #7c3aed;">Welcome to Task Manager!</h2>
        <p>Hi ${escapeHtml(username)},</p>
        <p>
          Thank you for creating an account.
          Please verify your email address by clicking the link below:
        </p>
        <p style:"margin: 32px 0;">
          <a style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;"
           href="${escapeHtml(verificationUrl)}">Verify my email address</a>
        </p>
        <p>This link expires in 24 hours. If you did not create this account, you can ignore this email.</p>
        <p style="color: #666;">If you didn't create this account, you can ignore this email.</p>
      </div>
      `,
  });

  if (result.error) {
    throw new Error(`Resend rejected the verification email: ${result.error.message}`);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}
