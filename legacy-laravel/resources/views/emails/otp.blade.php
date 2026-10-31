<x-mail::message>
    # Verifikasi Keamanan Akun Anda

    Halo,

    Kami mendeteksi adanya permintaan {{ strtolower(str_replace('Kode Verifikasi OTP', 'Verifikasi', $subjectLine)) }}.

    Kode Verifikasi One-Time Password (OTP) Anda adalah:

    <x-mail::panel>
        # **{{ $otp }}**
    </x-mail::panel>

    Kode ini berlaku selama {{ config('otp.expires_in') / 60 }} menit. Harap jangan berikan kode ini kepada siapa pun.

    Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.

    Terima kasih,
    {{ config('app.name') }}
</x-mail::message>
