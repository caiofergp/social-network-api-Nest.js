export class PasswordResetToken {
  id: string;
  token: string;
  expires_at: Date;
  user_id: string;
  used_at: Date | null;

  created_at?: Date;
  updated_at?: Date;
}
