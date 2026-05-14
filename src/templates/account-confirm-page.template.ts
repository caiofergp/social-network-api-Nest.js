export const accountConfirmPageTemplate = (success: boolean = true) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${success ? 'Account Confirmed' : 'Invalid Token'} | Social Network</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #6366f1;
                --bg: #f8fafc;
                --card-bg: #ffffff;
                --text-main: #1e293b;
                --text-muted: #64748b;
                --border: #e2e8f0;
                --success: #10b981;
                --error: #ef4444;
            }

            @media (prefers-color-scheme: dark) {
                :root {
                    --bg: #0f172a;
                    --card-bg: #1e293b;
                    --text-main: #f1f5f9;
                    --text-muted: #94a3b8;
                    --border: #334155;
                }
            }

            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                font-family: 'Inter', sans-serif;
            }

            body {
                background-color: var(--bg);
                color: var(--text-main);
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 20px;
                transition: background-color 0.3s ease;
            }

            .container {
                width: 100%;
                max-width: 440px;
                animation: fadeIn 0.6s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .card {
                background-color: var(--card-bg);
                border: 1px solid var(--border);
                border-radius: 24px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }

            .icon-wrapper {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                margin: 0 auto 24px;
            }
            
            .icon-wrapper span {
                height: 55px;
                width: 55px;
                
            }

            .success-icon {
                background-color: rgba(16, 185, 129, 0.1);
                color: var(--success);
            }

            .error-icon {
                background-color: rgba(239, 68, 68, 0.1);
                color: var(--error);
            }

            h1 {
                font-size: 24px;
                font-weight: 700;
                letter-spacing: -0.025em;
                margin-bottom: 12px;
            }

            p {
                color: var(--text-muted);
                font-size: 15px;
                line-height: 1.6;
                margin-bottom: 24px;
            }

            .logo {
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, var(--primary) 0%, #a855f7 100%);
                border-radius: 12px;
                margin: 0 auto 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 800;
                font-size: 24px;
                box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
            }

            .footer {
                margin-top: 32px;
                text-align: center;
                font-size: 14px;
                color: var(--text-muted);
            }

            .btn {
                display: inline-block;
                padding: 12px 24px;
                background-color: var(--primary);
                color: white;
                text-decoration: none;
                border-radius: 12px;
                font-weight: 600;
                transition: all 0.2s;
                margin-top: 8px;
            }

            .btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
                filter: brightness(1.1);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="logo">S</div>
                ${
                  success
                    ? `
                    <div class="icon-wrapper success-icon"><span>✓</span></div>
                    <h1>Account Confirmed!</h1>
                    <p>Your account has been successfully verified. You can now access all features of our network.</p>
                `
                    : `
                    <div class="icon-wrapper error-icon"><span>⚠️</span></div>
                    <h1>Verification Failed</h1>
                    <p>The confirmation link is invalid, expired, or has already been used. Please request a new verification email.</p>
                `
                }
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Social Network</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
