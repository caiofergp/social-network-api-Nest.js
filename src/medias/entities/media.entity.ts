export class Media {
  id: string;
  user_id?: string | null;
  entity_type: string;
  entity_id?: string | null;
  type: string;
  file_name?: string | null;
  mime_type: string;
  url?: string | null;
  path: string;
  size?: number | null;
  metadata?: any | null;

  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}
