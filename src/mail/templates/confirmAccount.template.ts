type ConfirmAccountTemplateProps = {
  name: string;
  confirmationLink: string;
  expirationTime: string;
  companyName: string;
  supportEmail: string;
};

export function confirmAccountTemplate({
  name,
  confirmationLink,
  expirationTime,
  companyName,
  supportEmail,
}: ConfirmAccountTemplateProps): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Account Confirmation</title>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        background-color: #f3f4f6;
        font-family: Arial, Helvetica, sans-serif;
      ">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 40px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="
                max-width: 480px;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
              ">
                <!-- Header -->
                <tr>
                  <td style="
                    background-color: #4f46e5;
                    padding: 20px;
                    text-align: center;
                    color: #ffffff;
                    font-size: 20px;
                    font-weight: bold;
                  ">
                    ${companyName}
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 24px; color: #111827; font-size: 14px;">
                    <p style="margin: 0 0 12px;">
                      Hello <strong>${name}</strong>,
                    </p>

                    <p style="margin: 0 0 16px;">
                      We received a request to confirm your account.
                    </p>

                    <p style="margin: 0 0 24px; text-align: center;">
                      <a href="${confirmationLink}" style="
                        display: inline-block;
                        padding: 12px 20px;
                        background-color: #4f46e5;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: bold;
                      ">
                        Confirm Account
                      </a>
                    </p>

                    <p style="margin: 0 0 12px; color: #374151;">
                      This link is valid for <strong>${expirationTime}</strong>.
                    </p>

                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      If you did not request this confirmation, you can safely ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="
                    background-color: #f9fafb;
                    padding: 16px;
                    text-align: center;
                    font-size: 12px;
                    color: #6b7280;
                  ">
                    Need help? Contact us at
                    <a href="mailto:${supportEmail}" style="color: #4f46e5;">
                      ${supportEmail}
                    </a>
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
