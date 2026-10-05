import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { seedDatabaseIfEmpty } from '@/lib/db';

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (env.ENABLE_LOCAL_DEMO_SEED !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Demo seeding is disabled.' },
        { status: 404 }
      );
    }

    const result = await seedDatabaseIfEmpty(env.DB, true);
    return NextResponse.json({ success: true, seeded: result.seeded });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Seed failed', details: String(err) },
      { status: 500 }
    );
  }
}