import { Media } from 'src/medias/entities/media.entity';

export class User {
  id: string;
  avatar_id?: string | null;
  cover_id?: string | null;
  name: string;
  email: string;
  password: string;
  bio?: string | null;
  birth_date?: Date | null;
  gender?: string | null;
  location?: string | null;
  website?: string | null;
  token: string | null;
  expires_at: Date | null;
  email_verified_at?: Date | null;

  avatar?: Media | null;
  cover?: Media | null;

  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}
