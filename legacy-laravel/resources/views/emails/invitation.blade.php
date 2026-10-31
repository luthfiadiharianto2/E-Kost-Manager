@component('mail::message')
    # Undangan Bergabung ke {{ $kostName }}

    Halo {{ $invitation->name ?? 'Calon Penyewa' }},

    Anda telah diundang oleh **{{ $ownerName }}** untuk bergabung sebagai penyewa di **{{ $kostName }}**.

    Klik tombol di bawah ini untuk menerima undangan dan menyelesaikan pendaftaran:

    @component('mail::button', ['url' => $acceptUrl, 'color' => 'primary'])
        Terima Undangan
    @endcomponent

    Atau salin dan buka tautan berikut di browser Anda:
    {{ $acceptUrl }}

    **Informasi Penting:**
    - Tautan ini akan kedaluwarsa dalam 7 hari
    - Anda akan diminta untuk membuat password
    - Email: {{ $invitation->email }}

    Jika Anda tidak merasa mendaftar atau tidak mengenal pemilik kos ini, abaikan email ini.

    Terima kasih,<br>
    {{ config('app.name') }}

    ---

    <small style="color: #999;">
        Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
    </small>
@endcomponent
