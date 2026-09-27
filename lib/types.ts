export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type BoardVisibility = 'public' | 'private';
export type BoardAccessRole = 'owner' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  emailVerified?: boolean;
  createdAt: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null; // ISO date string or null
  completed: boolean;
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[]; // ordered list of card IDs
}

export interface BoardMember {
  userId: string;
  role: BoardAccessRole;
  invitedAt: string;
}

export interface Board {
  id: string;
  title: string;
  accent: string; // hex colour for board accent
  columnIds: string[]; // ordered list of column IDs
  createdAt: string;
  ownerId: string;
  visibility: BoardVisibility;
  members: Record<string, BoardMember>;
}

export interface AppState {
  boards: Record<string, Board>;
  columns: Record<string, Column>;
  cards: Record<string, Card>;
  users: Record<string, User>;
  currentUserId: string | null;
  boardOrder: string[]; // ordered list of board IDs
}
