<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset Request</title>
</head>
<body>
    <p>Hello {{ $userName }},</p>
    <p>You requested to reset your password for your REMINDEr account.</p>
    <p>Click the button below to reset your password. This link will expire in {{ $expiresMinutes }} minutes.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="#FF6B6B">
                <a href="{{ $resetUrl }}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 5px;">
                    Reset Password
                </a>
            </td>
        </tr>
    </table>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thanks,<br>The REMINDEr Team</p>
</body>
</html>