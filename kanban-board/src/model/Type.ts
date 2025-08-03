export interface User{
  id: string;
  name: string;
  email: string;
}

export interface Card {
  _id: string;
  title: string;
  description?: string;
  position: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  _id: string;
  title: string;
  position: number;
  cards: Card[];
}

export interface Board {
  _id: string;
  name: string;
  columns: Column[];
}