<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Register - Kost Manager</title>
</head>
<body>
    <h2>Daftar Akun</h2>

    <form method="POST" action="{{ url('/api/register') }}">
        @csrf
        <label>Nama:</label><br>
        <input type="text" name="name" required><br><br>

        <label>Email:</label><br>
        <input type="email" name="email" required><br><br>

        <label>Password:</label><br>
        <input type="password" name="password" required><br><br>

        <button type="submit">Daftar</button>
    </form>

    <br>
    <a href="/">← Kembali</a>
</body>
</html>
