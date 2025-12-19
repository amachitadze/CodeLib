export type SnippetType = 'component' | 'website' | 'template';

export type Language = 'ka' | 'en' | 'es';

export interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  type: SnippetType;
  category: string;
  instruction?: string;
  createdAt: number;
  tags?: string[];
  isFavorite?: boolean;
  // Template specific fields
  imageUrl?: string;
  demoUrl?: string;
  downloadUrl?: string;
}

export enum ViewMode {
  GRID = 'GRID',
  LARGE_GRID = 'LARGE_GRID',
  LIST = 'LIST'
}

export enum TabState {
  PREVIEW = 'PREVIEW',
  CODE = 'CODE'
}