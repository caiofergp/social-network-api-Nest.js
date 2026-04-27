export class PostMedia {
  id: string;
  post_id: string;
  path: string;
  url?: string | null;
  type: string;

  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}
