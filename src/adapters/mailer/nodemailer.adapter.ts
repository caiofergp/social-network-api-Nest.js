import { MailerAdapter } from "./mailer.dapter";
import nodemailer from "nodemailer";

export class NodemailerAdapter implements MailerAdapter {
    private transporter: nodemailer.Transporter;

    constructor() {
        if(!this.transporter) {
            this.transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: Number(process.env.MAIL_PORT),
                secure: false,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                },
            });
        };
    }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
        from: '"Social Network" <social.network@gmail.com>',
        to,
        subject,    
        html: `<b>${html}</b>`,
    });
  }
}