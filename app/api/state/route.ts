import { NextResponse } from 'next/server';
import { getFullDatabaseState, saveFullDatabaseState } from '@/lib/db';
import type { AppState } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const state = getFullDatabaseState();
    return NextResponse.json(state);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to read database state', details: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AppState>;
    if (!body || !body.boards) {
      return NextResponse.json({ error: 'Invalid state payload' }, { status: 400 });
    }

    const currentState = getFullDatabaseState();
    const mergedState: AppState = {
      ...currentState,
      ...body,
      users: { ...currentState.users, ...(body.users ?? {}) },
      boards: { ...currentState.boards, ...(body.boards ?? {}) },
      columns: { ...currentState.columns, ...(body.columns ?? {}) },
      cards: { ...currentState.cards, ...(body.cards ?? {}) },
      boardOrder: body.boardOrder ?? currentState.boardOrder,
    };

    saveFullDatabaseState(mergedState);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update database state', details: String(err) }, { status: 500 });
  }
}
