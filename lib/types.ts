export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Card {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null; // ISO date string or null
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[]; // ordered list of card IDs
}

export interface Board {
  id: string;
  title: string;
  accent: string; // hex colour for board accent
  columnIds: string[]; // ordered list of column IDs
  createdAt: string;
}

export interface AppState {
  boards: Record<string, Board>;
  columns: Record<string, Column>;
  cards: Record<string, Card>;
  boardOrder: string[]; // ordered list of board IDs
}
