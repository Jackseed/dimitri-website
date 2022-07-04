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
  vignettePosition?: number;
  type?: 'vignette' | 'image';
}

export interface Project {
  id?: string;
  position?: number;
  title?: string;
  descriptions?: string[];
  status?: 'draft' | 'published';
}
