import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getFullStateFromD1, saveFullStateToD1 } from '@/lib/db';
import { getEffectiveRole } from '@/lib/rbac';
import { getSessionUserId } from '@/lib/server-auth';
import type { AppState, Board } from '@/lib/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function boardContent(state: AppState, board: Board): unknown {
  return {
    columnIds: board.columnIds,
    columns: board.columnIds.map((id) => {
      const column = state.columns[id];
      return column ? {
        id: column.id,
        title: column.title,
        cardIds: column.cardIds,
        cards: column.cardIds.map((cardId) => state.cards[cardId]),
      } : null;
    }),
  };
}

function visibleState(state: AppState, userId: string | null): AppState {
  const boards: AppState['boards'] = {};
  const columns: AppState['columns'] = {};
  const cards: AppState['cards'] = {};
  const visibleUserIds = new Set<string>();

  for (const board of Object.values(state.boards)) {
    if (!getEffectiveRole(userId, board.members, board.visibility, board.ownerId)) continue;
    const ownerMember = board.members[board.ownerId] ?? {
      userId: board.ownerId,
      role: 'owner' as const,
      invitedAt: board.createdAt,
    };
    const members = { [board.ownerId]: ownerMember };
    if (userId && board.members[userId]) members[userId] = board.members[userId];
    boards[board.id] = { ...board, members };
    visibleUserIds.add(board.ownerId);
    if (userId && board.members[userId]) visibleUserIds.add(userId);

    for (const columnId of board.columnIds) {
      const column = state.columns[columnId];
      if (!column) continue;
      columns[columnId] = column;
      for (const cardId of column.cardIds) {
        const card = state.cards[cardId];
        if (card) cards[cardId] = card;
      }
    }
  }
  if (userId && state.users[userId]) visibleUserIds.add(userId);

  const users = Object.fromEntries(
    [...visibleUserIds]
      .filter((id) => state.users[id])
      .map((id) => [id, { ...state.users[id], passwordHash: '' }]),
  );
  const boardOrder = state.boardOrder.filter((id) => boards[id]);
  return { users, boards, columns, cards, boardOrder, currentUserId: userId };
}

export async function GET(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const userId = await getSessionUserId(env.DB, request);
    const state = await getFullStateFromD1(env.DB, env.ENABLE_LOCAL_DEMO_SEED === 'true');
    return NextResponse.json(visibleState(state, userId));
  } catch (err) {
    console.error('Failed to read database state:', err);
    return NextResponse.json({ error: 'Failed to read database state' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const userId = await getSessionUserId(env.DB, request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
    }

    const body: unknown = await request.json();
    if (!isRecord(body) || !isRecord(body.boards) || !isRecord(body.columns) || !isRecord(body.cards)) {
      return NextResponse.json({ error: 'Invalid state payload' }, { status: 400 });
    }

    const current = await getFullStateFromD1(env.DB);
    if (!current.users[userId]) {
      return NextResponse.json({ error: 'The signed-in account no longer exists.' }, { status: 401 });
    }

    const submitted = body as Partial<AppState>;
    const submittedBoards = submitted.boards as AppState['boards'];
    const submittedColumns = submitted.columns as AppState['columns'];
    const submittedCards = submitted.cards as AppState['cards'];
    if (!Object.values(submittedBoards).every(isRecord)) {
      return NextResponse.json({ error: 'Invalid board data.' }, { status: 400 });
    }
    const nextBoards = { ...current.boards };
    const nextColumns = { ...current.columns };
    const nextCards = { ...current.cards };
    const deleteBoardIds: string[] = [];
    const deleteColumnIds = new Set<string>();
    const deleteCardIds = new Set<string>();
    const oldColumnBoards = new Map<string, string>();
    const oldCardBoards = new Map<string, string>();

    for (const board of Object.values(current.boards)) {
      for (const columnId of board.columnIds) {
        oldColumnBoards.set(columnId, board.id);
        for (const cardId of current.columns[columnId]?.cardIds ?? []) oldCardBoards.set(cardId, board.id);
      }
    }

    for (const board of Object.values(current.boards)) {
      const role = getEffectiveRole(userId, board.members, board.visibility, board.ownerId);
      if (!role) continue;
      const proposed = submittedBoards[board.id];
      if (!proposed) {
        if (role !== 'owner') {
          return NextResponse.json({ error: 'Only the board owner can delete a board.' }, { status: 403 });
        }
        deleteBoardIds.push(board.id);
        delete nextBoards[board.id];
        continue;
      }

      if (proposed.id !== board.id || proposed.ownerId !== board.ownerId) {
        return NextResponse.json({ error: 'Board identity and ownership cannot be changed here.' }, { status: 403 });
      }
      if (typeof proposed.title !== 'string' || typeof proposed.accent !== 'string' ||
        !['public', 'private'].includes(proposed.visibility) || typeof proposed.createdAt !== 'string' ||
        !Array.isArray(proposed.columnIds) || proposed.columnIds.some((id) => typeof id !== 'string')) {
        return NextResponse.json({ error: 'Invalid board settings or columns.' }, { status: 400 });
      }
      if (role !== 'owner' &&
        (proposed.title !== board.title || proposed.accent !== board.accent ||
          proposed.visibility !== board.visibility || proposed.createdAt !== board.createdAt)) {
        return NextResponse.json({ error: 'Only the board owner can change board settings.' }, { status: 403 });
      }
      if (role === 'viewer' &&
        stableJson(boardContent(current, board)) !== stableJson(boardContent(
          { ...current, columns: submittedColumns, cards: submittedCards },
          proposed,
        ))) {
        return NextResponse.json({ error: 'Editors and owners are required to change board contents.' }, { status: 403 });
      }

      const authoritativeBoard: Board = { ...proposed, members: board.members };
      nextBoards[board.id] = authoritativeBoard;

      if (role === 'viewer') continue;
      const retainedCards = new Set<string>();
      for (const columnId of proposed.columnIds) {
        if (oldColumnBoards.has(columnId) && oldColumnBoards.get(columnId) !== board.id) {
          return NextResponse.json({ error: 'A column cannot be moved between boards.' }, { status: 400 });
        }
        const column = submittedColumns[columnId];
        if (!column || column.id !== columnId || typeof column.title !== 'string' || !Array.isArray(column.cardIds)) {
          return NextResponse.json({ error: 'Invalid column data.' }, { status: 400 });
        }
        nextColumns[columnId] = column;
        for (const cardId of column.cardIds) {
          if (oldCardBoards.has(cardId) && oldCardBoards.get(cardId) !== board.id) {
            return NextResponse.json({ error: 'A card cannot be moved between boards.' }, { status: 400 });
          }
          const card = submittedCards[cardId];
          if (!card || card.id !== cardId ||
            typeof card.title !== 'string' ||
            typeof card.description !== 'string' ||
            !['low', 'medium', 'high', 'urgent'].includes(card.priority) ||
            (card.dueDate !== null && typeof card.dueDate !== 'string') ||
            typeof card.completed !== 'boolean' ||
            typeof card.createdAt !== 'string') {
            return NextResponse.json({ error: 'Invalid card data.' }, { status: 400 });
          }
          nextCards[cardId] = card;
          retainedCards.add(cardId);
        }
      }
      for (const oldColumnId of board.columnIds) {
        const oldColumn = current.columns[oldColumnId];
        if (!proposed.columnIds.includes(oldColumnId)) {
          delete nextColumns[oldColumnId];
          deleteColumnIds.add(oldColumnId);
          for (const cardId of oldColumn?.cardIds ?? []) {
            delete nextCards[cardId];
            deleteCardIds.add(cardId);
          }
        } else {
          for (const cardId of oldColumn?.cardIds ?? []) {
            if (!retainedCards.has(cardId)) {
              delete nextCards[cardId];
              deleteCardIds.add(cardId);
            }
          }
        }
      }
    }

    for (const [boardId, proposed] of Object.entries(submittedBoards)) {
      if (current.boards[boardId]) continue;
      if (!proposed || proposed.id !== boardId || proposed.ownerId !== userId) {
        return NextResponse.json({ error: 'New boards must be owned by the signed-in user.' }, { status: 403 });
      }
      if (typeof proposed.title !== 'string' || typeof proposed.accent !== 'string' ||
        !['public', 'private'].includes(proposed.visibility) || typeof proposed.createdAt !== 'string') {
        return NextResponse.json({ error: 'Invalid new board data.' }, { status: 400 });
      }
      proposed.members = {
        [userId]: { userId, role: 'owner', invitedAt: proposed.createdAt },
      };
      nextBoards[boardId] = proposed;
      if (!Array.isArray(proposed.columnIds) || proposed.columnIds.some((id) => typeof id !== 'string')) {
        return NextResponse.json({ error: 'Invalid board columns.' }, { status: 400 });
      }
      for (const columnId of proposed.columnIds) {
        if (oldColumnBoards.has(columnId)) {
          return NextResponse.json({ error: 'A column cannot be moved between boards.' }, { status: 400 });
        }
        const column = submittedColumns[columnId];
        if (!column || column.id !== columnId || typeof column.title !== 'string' || !Array.isArray(column.cardIds)) {
          return NextResponse.json({ error: 'Invalid column data.' }, { status: 400 });
        }
        nextColumns[columnId] = column;
        for (const cardId of column.cardIds) {
          const card = submittedCards[cardId];
          if (oldCardBoards.has(cardId) || !card || card.id !== cardId ||
            typeof card.title !== 'string' ||
            typeof card.description !== 'string' ||
            !['low', 'medium', 'high', 'urgent'].includes(card.priority) ||
            (card.dueDate !== null && typeof card.dueDate !== 'string') ||
            typeof card.completed !== 'boolean' ||
            typeof card.createdAt !== 'string') {
            return NextResponse.json({ error: 'Invalid card data.' }, { status: 400 });
          }
          nextCards[cardId] = card;
        }
      }
    }

    if (deleteBoardIds.length || deleteColumnIds.size || deleteCardIds.size) {
      const deletes = [
        ...deleteBoardIds.map((id) => env.DB.prepare('DELETE FROM boards WHERE id = ?').bind(id)),
        ...[...deleteColumnIds].map((id) => env.DB.prepare('DELETE FROM columns WHERE id = ?').bind(id)),
        ...[...deleteCardIds].map((id) => env.DB.prepare('DELETE FROM cards WHERE id = ?').bind(id)),
      ];
      await env.DB.batch(deletes);
    }

    const boardOrder = [
      ...new Set([
        ...(Array.isArray(submitted.boardOrder) ? submitted.boardOrder.filter((id): id is string => typeof id === 'string') : []),
        ...current.boardOrder,
      ]),
    ].filter((id) => nextBoards[id]);
    const snapshot: AppState = {
      currentUserId: userId,
      users: current.users,
      boards: nextBoards,
      columns: nextColumns,
      cards: nextCards,
      boardOrder,
    };
    await saveFullStateToD1(env.DB, snapshot);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to update database state:', err);
    return NextResponse.json({ error: 'Failed to update database state' }, { status: 500 });
  }
}
