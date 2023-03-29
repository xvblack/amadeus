export interface Post {
  id?: number;
  url: string;
  time_added: number;
  time_added_as_date?: string;
  source: string;
  tags: string[];
  attrs: Record<string, any>;
  links: Record<string, string>;
  title?: string;
  abstract?: string;
}
