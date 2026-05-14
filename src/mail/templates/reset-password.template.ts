type ResetPasswordTemplateProps = {
  name: string;
  resetPasswordLink: string;
  expirationTime: string;
  companyName: string;
  supportEmail: string;
};

export function resetPasswordTemplate({
  name,
  resetPasswordLink,
  expirationTime,
  companyName,
  supportEmail,
}: ResetPasswordTemplateProps): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset</title>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        background-color: #f3f4f6;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
      ">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" style="padding: 40px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="
                max-width: 500px;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              ">
                <!-- Header / Logo -->
                <tr>
                  <td style="
                    background-color: #6366f1;
                    padding: 32px 20px;
                    text-align: center;
                    color: #ffffff;
                  ">
                    <h1 style="
                      margin: 0;
                      font-size: 24px;
                      font-weight: 800;
                      letter-spacing: -0.025em;
                      text-transform: uppercase;
                    ">
                      ${companyName}
                    </h1>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px 32px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                    <p style="margin: 0 0 16px; font-weight: 600; font-size: 18px;">
                      Hello, ${name}!
                    </p>

                    <p style="margin: 0 0 24px; color: #4b5563;">
                      We received a request to reset your account password. If you did not make this request, you can safely ignore this email.
                    </p>

                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${resetPasswordLink}" style="
                        display: inline-block;
                        padding: 14px 32px;
                        background-color: #6366f1;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 700;
                        font-size: 16px;
                        transition: background-color 0.2s;
                        box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
                      ">
                        Reset My Password
                      </a>
                    </div>

                    <p style="margin: 0 0 24px; color: #ef4444; font-size: 14px; background-color: #fef2f2; padding: 12px; border-radius: 6px; border-left: 4px solid #ef4444;">
                      <strong>Attention:</strong> For security reasons, this link is valid only until <strong>${expirationTime}</strong>.
                    </p>

                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                    <p style="margin: 0; color: #6b7280; font-size: 13px;">
                      If the button above does not work, copy and paste the link below in your browser:
                    </p>
                    <p style="margin: 8px 0 0; color: #6366f1; font-size: 13px; word-break: break-all;">
                      ${resetPasswordLink}
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="
                    background-color: #f9fafb;
                    padding: 24px;
                    text-align: center;
                    font-size: 13px;
                    color: #9ca3af;
                  ">
                    <p style="margin: 0 0 8px;">
                      &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
                    </p>
                    <p style="margin: 0;">
                      Need support? Contact us at:
                      <a href="mailto:${supportEmail}" style="color: #6366f1; text-decoration: none; font-weight: 500;">
                        ${supportEmail}
                      </a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Bottom spacing info -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 500px;">
                <tr>
                  <td style="padding: 24px 0; text-align: center; font-size: 11px; color: #9ca3af;">
                    You received this email because a password reset request was made for your account on the ${companyName} platform.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
