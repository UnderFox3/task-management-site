import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { seedDatabaseIfEmpty } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const result = await seedDatabaseIfEmpty(env.DB);
    return NextResponse.json({ success: true, seeded: result.seeded });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Seed failed', details: String(err) },
      { status: 500 }
    );
  }
}