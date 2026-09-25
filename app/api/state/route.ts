import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getFullStateFromD1, saveFullStateToD1 } from '@/lib/db';
import type { AppState } from '@/lib/types';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
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
    if (!body || !body.boards) {
      return NextResponse.json({ error: 'Invalid state payload' }, { status: 400 });
    }

    const currentState = await getFullStateFromD1(env.DB);
    const mergedState: AppState = {
      ...currentState,
      ...body,
      users:      { ...currentState.users,   ...(body.users   ?? {}) },
      boards:     { ...currentState.boards,   ...(body.boards  ?? {}) },
      columns:    { ...currentState.columns,  ...(body.columns ?? {}) },
      cards:      { ...currentState.cards,    ...(body.cards   ?? {}) },
      boardOrder: body.boardOrder ?? currentState.boardOrder,
    };

    await saveFullStateToD1(env.DB, mergedState);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to update database state', details: String(err) },
      { status: 500 }
    );
  }
}
