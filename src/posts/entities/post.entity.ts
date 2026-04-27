export class Post {
  id: string;
  content: string | null;
  user_id: string;

  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
