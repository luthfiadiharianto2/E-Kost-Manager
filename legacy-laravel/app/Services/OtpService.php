<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class OtpService
{
    // Generate OTP untuk user yang sudah ada (by user_id)
    public static function generateOtp($userId)
    {
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        Cache::put("otp_user_{$userId}", $otp, now()->addMinutes(10));
        return $otp;
    }

    // Verify OTP untuk user yang sudah ada
    public static function verifyOtp($userId, $otp)
    {
        $cached = Cache::get("otp_user_{$userId}");
        if ($cached && $cached === $otp) {
            Cache::forget("otp_user_{$userId}");
            return ['ok' => true];
        }
        return ['ok' => false];
    }

    // Generate OTP untuk email (untuk registrasi - user belum ada)
    public static function generateOtpForEmail($email)
    {
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        Cache::put("otp_email_{$email}", $otp, now()->addMinutes(10));
        return $otp;
    }

    // Verify OTP untuk email (untuk registrasi)
    public static function verifyOtpForEmail($email, $otp)
    {
        $cached = Cache::get("otp_email_{$email}");
        if ($cached && $cached === $otp) {
            Cache::forget("otp_email_{$email}");
            return ['ok' => true];
        }
        return ['ok' => false];
    }
}
