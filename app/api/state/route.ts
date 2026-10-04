import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getFullStateFromD1, saveFullStateToD1, seedDatabaseIfEmpty } from '@/lib/db';
import type { AppState } from '@/lib/types';

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    await seedDatabaseIfEmpty(env.DB);
    const state = await getFullStateFromD1(env.DB);
    return NextResponse.json(state);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to read database state', details: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const body = (await request.json()) as Partial<AppState>;
    if (!body || !body.boards || !body.columns || !body.cards) {
      return NextResponse.json({ error: 'Invalid state payload' }, { status: 400 });
    }

    const currentState = await getFullStateFromD1(env.DB);

    const snapshot: AppState = {
      currentUserId: null,
      users: currentState.users,
      boards: body.boards,
      columns: body.columns,
      cards: body.cards,
      boardOrder: body.boardOrder ?? [],
    };

    await saveFullStateToD1(env.DB, snapshot);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to update database state', details: String(err) },
      { status: 500 }
    );
  }
}
