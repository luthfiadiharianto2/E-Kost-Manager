<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Login - Kost Manager</title>
</head>
<body>
    <h2>Login</h2>

    <form method="POST" action="{{ url('/api/login') }}">
        @csrf
        <label>Email:</label><br>
        <input type="email" name="email" required><br><br>

        <label>Password:</label><br>
        <input type="password" name="password" required><br><br>

        <button type="submit">Login</button>
    </form>

    <br>
    <a href="/">← Kembali</a>
</body>
</html>
