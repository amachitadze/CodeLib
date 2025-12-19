export type SnippetType = 'component' | 'website';

export type Language = 'ka' | 'en' | 'es';

export interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  type: SnippetType;
  category: string;
  instruction?: string; // New field for instructions
  createdAt: number;
  tags?: string[];
  isFavorite?: boolean;
}

export enum ViewMode {
  GRID = 'GRID',         // 3 columns
  LARGE_GRID = 'LARGE_GRID', // 2 columns
  LIST = 'LIST'          // 1 column
}

export enum TabState {
  PREVIEW = 'PREVIEW',
  CODE = 'CODE'
}