function generateForgotPasswordEmailTemplate(resetPasswordUrl) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <title>FYP SYSTEM _ PASSWORD Reset Request</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            background-color: #f4f7fb;
            font-family: Arial, Helvetica, sans-serif;
            color: #1f2937;
        }

        .wrapper {
            width: 100%;
            padding: 40px 15px;
            background-color: #f4f7fb;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
        }

        /* NAVBAR */
        .navbar {
            background-color: #111827;
            padding: 20px 30px;
        }

        .brand {
            color: #ffffff;
            font-size: 22px;
            font-weight: bold;
        }

        .nav-links {
            text-align: right;
        }

        .nav-links a {
            color: #d1d5db;
            text-decoration: none;
            font-size: 13px;
            margin-left: 15px;
        }

        /* MAIN */
        .main {
            padding: 40px;
            text-align: center;
        }

        .icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 25px;
            border-radius: 50%;
            background-color: #eef2ff;
            line-height: 64px;
            font-size: 30px;
        }

        .title {
            margin: 0 0 15px;
            font-size: 28px;
            color: #111827;
        }

        .description {
            margin: 0 auto 30px;
            max-width: 480px;
            color: #6b7280;
            font-size: 15px;
            line-height: 24px;
        }

        /* BUTTON */
        .button {
            display: inline-block;
            padding: 14px 30px;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            font-size: 15px;
            font-weight: bold;
            border-radius: 7px;
        }

        /* FALLBACK URL */
        .fallback {
            margin-top: 30px;
            padding: 18px;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            text-align: left;
        }

        .fallback-title {
            margin: 0 0 8px;
            font-size: 13px;
            font-weight: bold;
            color: #374151;
        }

        .fallback-url {
            margin: 0;
            font-size: 12px;
            line-height: 18px;
            word-break: break-all;
            color: #4f46e5;
        }

        /* SECURITY */
        .security {
            margin-top: 25px;
            padding: 16px;
            background-color: #fff7ed;
            border-left: 4px solid #f97316;
            border-radius: 5px;
            text-align: left;
        }

        .security-title {
            margin: 0 0 6px;
            font-size: 13px;
            font-weight: bold;
            color: #9a3412;
        }

        .security-text {
            margin: 0;
            font-size: 12px;
            line-height: 19px;
            color: #7c2d12;
        }

        .expiration {
            margin-top: 25px;
            font-size: 12px;
            color: #9ca3af;
            line-height: 19px;
        }

        /* FOOTER */
        .footer {
            padding: 25px 30px;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }

        .footer-brand {
            margin: 0 0 8px;
            font-size: 14px;
            font-weight: bold;
            color: #374151;
        }

        .footer-text {
            margin: 0 0 12px;
            font-size: 12px;
            line-height: 18px;
            color: #9ca3af;
        }

        .footer-links a {
            color: #4f46e5;
            font-size: 12px;
            text-decoration: none;
            margin: 0 6px;
        }

        .copyright {
            margin-top: 15px;
            font-size: 11px;
            color: #9ca3af;
        }

        /* MOBILE */
        @media only screen and (max-width: 600px) {

            .wrapper {
                padding: 20px 10px;
            }

            .navbar {
                padding: 20px;
            }

            .nav-links {
                display: none;
            }

            .main {
                padding: 30px 20px;
            }

            .title {
                font-size: 24px;
            }

            .button {
                display: block;
                width: 100%;
            }

            .footer {
                padding: 22px 18px;
            }
        }
    </style>
</head>

<body>

    <div class="wrapper">

        <div class="container">

            <!-- =========================
                 NAVBAR
            ========================== -->

            <div class="navbar">

                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>

                        <td>
                            <div class="brand">
                                ProjectHub
                            </div>
                        </td>

                        <td class="nav-links">
                            <a href="#">
                                Home
                            </a>

                            <a href="#">
                                Contact
                            </a>
                        </td>

                    </tr>
                </table>

            </div>


            <!-- =========================
                 MAIN CONTENT
            ========================== -->

            <div class="main">

                <div class="icon">
                    🔐
                </div>

                <h1 class="title">
                    Reset Your Password
                </h1>

                <p class="description">
                    We received a request to reset the password
                    associated with your ProjectHub account.
                    Click the button below to create a new password.
                </p>


                <!-- RESET BUTTON -->

                <a
                    href="${resetPasswordUrl}"
                    class="button"
                >
                    Reset My Password
                </a>


                <!-- FALLBACK URL -->

                <div class="fallback">

                    <p class="fallback-title">
                        Button not working?
                    </p>

                    <p class="fallback-url">
                        ${resetPasswordUrl}
                    </p>

                </div>


                <!-- SECURITY NOTICE -->

                <div class="security">

                    <p class="security-title">
                        Security Notice
                    </p>

                    <p class="security-text">
                        If you did not request a password reset,
                        you can safely ignore this email.
                        Your password will remain unchanged.
                    </p>

                </div>


                <!-- EXPIRATION -->

                <p class="expiration">
                    For your security, this password reset link
                    is valid for a limited time.
                </p>

            </div>


            <!-- =========================
                 FOOTER
            ========================== -->

            <div class="footer">

                <p class="footer-brand">
                    ProjectHub
                </p>

                <p class="footer-text">
                    This is an automated security email.
                    Please do not reply to this message.
                </p>

                <div class="footer-links">

                    <a href="#">
                        Website
                    </a>

                    <a href="#">
                        Contact
                    </a>

                    <a href="#">
                        Privacy
                    </a>

                </div>

                <p class="copyright">
                    © ${new Date().getFullYear()} ProjectHub.
                    All rights reserved.
                </p>

            </div>

        </div>

    </div>

</body>
</html>
`;
}

module.exports = generateForgotPasswordEmailTemplate;