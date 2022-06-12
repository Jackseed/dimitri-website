export interface Grid {
  cols: number;
  gutterSize: string;
}

export interface Image {
  img?: string;
  alt?: string;
  link?: string;
  id?: string;
  url?: string;
  path?: string;
  projectId?: string;
  position?: number;
}

export interface Project {
  id?: string;
  position?: number;
  title?: string;
  description?: string;
  status?: 'draft' | 'published';
}
