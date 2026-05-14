import dotenv from 'dotenv';
dotenv.config();

const APP_URL = process.env.APP_URL!;

export const resetPasswordFormTemplate = (
  token: string,
  tokenIsValid: boolean = true,
) => {
  if (!tokenIsValid) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invalid Token | Social Network</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                :root {
                    --primary: #6366f1;
                    --bg: #f8fafc;
                    --card-bg: #ffffff;
                    --text-main: #1e293b;
                    --text-muted: #64748b;
                    --border: #e2e8f0;
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
                }

                .container {
                    width: 100%;
                    max-width: 440px;
                }

                .card {
                    background-color: var(--card-bg);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 40px;
                    text-align: center;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .icon {
                    width: 64px;
                    height: 64px;
                    background-color: rgba(239, 68, 68, 0.1);
                    color: var(--error);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                    font-size: 32px;
                }

                .icon span {
                    height: 55px;
                    width: 43px;
                }

                h1 {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 12px;
                }

                p {
                    color: var(--text-muted);
                    font-size: 15px;
                    line-height: 1.6;
                    margin-bottom: 24px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="icon"><span>⚠️</span></div>
                    <h1>Invalid or Expired Token</h1>
                    <p>The password reset link you accessed is invalid or has expired.</p>
                </div>
            </div>
        </body>
        </html>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password | Social Network</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #6366f1;
                --primary-hover: #4f46e5;
                --bg: #f8fafc;
                --card-bg: #ffffff;
                --text-main: #1e293b;
                --text-muted: #64748b;
                --border: #e2e8f0;
                --error: #ef4444;
                --success: #10b981;
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
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }

            .header {
                text-align: center;
                margin-bottom: 32px;
            }

            .logo {
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, var(--primary) 0%, #a855f7 100%);
                border-radius: 12px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 800;
                font-size: 24px;
                box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
            }

            h1 {
                font-size: 24px;
                font-weight: 700;
                letter-spacing: -0.025em;
                margin-bottom: 8px;
            }

            p.subtitle {
                color: var(--text-muted);
                font-size: 15px;
            }

            .form-group {
                margin-bottom: 20px;
            }

            label {
                display: block;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 8px;
                color: var(--text-main);
            }

            .input-wrapper {
                position: relative;
            }

            input {
                width: 100%;
                padding: 12px 16px;
                background-color: transparent;
                border: 1px solid var(--border);
                border-radius: 12px;
                color: var(--text-main);
                font-size: 15px;
                transition: all 0.2s;
                outline: none;
            }

            input:focus {
                border-color: var(--primary);
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
            }

            button {
                width: 100%;
                padding: 14px;
                background-color: var(--primary);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 10px;
                box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
            }

            button:hover {
                background-color: var(--primary-hover);
                transform: translateY(-1px);
                box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
            }

            button:active {
                transform: translateY(0);
            }

            button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .error-message {
                color: var(--error);
                font-size: 13px;
                margin-top: 6px;
                display: none;
                animation: shake 0.4s ease;
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            .footer {
                margin-top: 32px;
                text-align: center;
                font-size: 14px;
                color: var(--text-muted);
            }

            .footer a {
                color: var(--primary);
                text-decoration: none;
                font-weight: 500;
            }

            /* Loading Spinner */
            .spinner {
                display: none;
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 0.8s linear infinite;
                margin: 0 auto;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Success State */
            .success-card {
                display: none;
                text-align: center;
            }

            .success-icon {
                width: 64px;
                height: 64px;
                background-color: rgba(16, 185, 129, 0.1);
                color: var(--success);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                margin: 0 auto 24px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card" id="form-card">
                <div class="header">
                    <div class="logo">S</div>
                    <h1>Reset Password</h1>
                    <p class="subtitle">Choose a new secure password for your account</p>
                </div>

                <form id="reset-form">
                    <div class="form-group">
                        <label for="password">New Password</label>
                        <input type="password" id="password" name="password" placeholder="••••••••" required minlength="8">
                    </div>

                    <div class="form-group">
                        <label for="confirm-password">Confirm New Password</label>
                        <input type="password" id="confirm-password" placeholder="••••••••" required minlength="8">
                        <div id="match-error" class="error-message">Passwords do not match</div>
                    </div>

                    <button type="submit" id="submit-btn" style="position: relative;">
                        <span id="btn-text">Update Password</span>
                        <div class="spinner" id="spinner"></div>
                    </button>
                </form>

                <div id="api-error" class="error-message" style="text-align:center; margin-top:16px;">
                    An error occurred. Please try again later.
                </div>
            </div>

            <div class="card success-card" id="success-card">
                <div class="success-icon">✓</div>
                <h1>Password Updated!</h1>
                <p class="subtitle" style="margin-bottom: 32px;">Your password has been successfully reset. You can now close this page.</p>
            </div>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Social Network</p>
            </div>
        </div>

        <script>
            const form = document.getElementById('reset-form');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirm-password');
            const matchError = document.getElementById('match-error');
            const apiError = document.getElementById('api-error');
            const submitBtn = document.getElementById('submit-btn');
            const btnText = document.getElementById('btn-text');
            const spinner = document.getElementById('spinner');
            const formCard = document.getElementById('form-card');
            const successCard = document.getElementById('success-card');

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Reset errors
                matchError.style.display = 'none';
                apiError.style.display = 'none';
                
                // Validate match
                if (passwordInput.value !== confirmPasswordInput.value) {
                    matchError.style.display = 'block';
                    return;
                }

                // Loading state
                submitBtn.disabled = true;
                btnText.style.display = 'none';
                spinner.style.display = 'block';

                try {
                    const response = await fetch(\`${APP_URL}/reset-password/${token}\`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            password: passwordInput.value
                        })
                    });

                    if (response.ok) {
                        formCard.style.display = 'none';
                        successCard.style.display = 'block';
                    } else {
                        const data = await response.json();
                        throw new Error(data.message || 'Error resetting password');
                    }
                } catch (error) {
                    console.error(error);
                    apiError.textContent = error.message;
                    apiError.style.display = 'block';
                    
                    submitBtn.disabled = false;
                    btnText.style.display = 'block';
                    spinner.style.display = 'none';
                }
            });

            // Clear error on input
            confirmPasswordInput.addEventListener('input', () => {
                if (passwordInput.value === confirmPasswordInput.value) {
                    matchError.style.display = 'none';
                }
            });
        </script>
    </body>
    </html>
  `;
};
