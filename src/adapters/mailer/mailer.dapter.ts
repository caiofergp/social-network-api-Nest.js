export abstract class MailerAdapter {
  abstract sendMail(to: string, subject: string, html: string): Promise<void>;
}