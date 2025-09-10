<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Doctor Approved</title>
    <style>
        body { font-family: Arial, sans-serif; color: #111827; }
        .container { max-width: 560px; margin: 0 auto; padding: 16px; }
        .btn { background: #2563eb; color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px; }
    </style>
    </head>
<body>
<div class="container">
    <h2>Hello {{ $doctor->name }},</h2>
    <p>Your doctor account has been approved. You can now sign in and complete your profile.</p>
    <p>Login Email: <strong>{{ $doctor->email }}</strong></p>
    <p>If you did not request this, please contact support.</p>
    <p>Thank you,<br/>The Team</p>
</div>
</body>
</html>



