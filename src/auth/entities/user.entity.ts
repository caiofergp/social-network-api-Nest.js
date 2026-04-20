export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  token: string | null;
  expires_at: Date | null;
  email_verified_at?: Date | null;

  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}
