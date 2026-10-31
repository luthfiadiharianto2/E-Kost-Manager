<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use App\Services\OtpService;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class OtpController extends Controller
{
    // Request OTP - UNTUK REGISTRASI (user belum ada)
    public function requestOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email' // REMOVE exists:users,email
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Generate OTP untuk email
        $otp = OtpService::generateOtpForEmail($request->email);

        // 1. Logging OTP (Sesuai permintaan Anda)
        Log::info('📩 [OTP Request - Registration] OTP (' . $otp . ') for email: ' . $request->email);

        // 2. Kirim email dengan OTP
        try {
            Mail::to($request->email)->send(new OtpMail($otp, 'Kode Verifikasi Pendaftaran'));

            Log::info('📧 Email OTP berhasil dikirim ke: ' . $request->email);

            $responsePayload = [
                'success' => true,
                'message' => 'Kode OTP 6 digit telah dikirim ke email Anda. Silakan cek kotak masuk/spam.',
                'email' => $request->email,
            ];

            if (app()->environment('local', 'testing')) {
                $responsePayload['otp'] = $otp;
            }

            return response()->json($responsePayload);
        } catch (\Exception $e) {
            Log::error('❌ Gagal mengirim email OTP ke ' . $request->email . ': ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email OTP. Silakan coba lagi atau hubungi dukungan.',
                'error_details' => $e->getMessage() // Opsi: Hapus di production
            ], 500);
        }
    }

    // Verifikasi OTP - UNTUK REGISTRASI
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $res = OtpService::verifyOtpForEmail($request->email, $request->otp);

        if ($res['ok']) {
            return response()->json([
                'success' => true,
                'message' => 'OTP valid. Silakan lanjutkan registrasi.'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'OTP tidak valid atau sudah kadaluarsa.'
        ], 422);
    }

    // Request OTP untuk user yang sudah login (forgot password, dll)
    public function requestOtpForUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ]);

        if ($validator->fails()) {
            // ... (Error handling)
        }

        $user = User::where('email', $request->email)->first();
        $otp = OtpService::generateOtp($user->id);

        // 1. Logging OTP (Sesuai permintaan Anda)
        Log::info('🔐 [OTP Request - Existing User] OTP (' . $otp . ') for user: ' . $user->email);

        // 2. Kirim email dengan OTP
        try {
            Mail::to($user->email)->send(new OtpMail($otp, 'Kode Verifikasi Perubahan Password'));

            Log::info('📧 Email OTP berhasil dikirim ke: ' . $user->email);

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP 6 digit telah dikirim ke email Anda. Silakan cek kotak masuk/spam.',
                'email' => $user->email
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Gagal mengirim email OTP ke ' . $user->email . ': ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email OTP. Silakan coba lagi atau hubungi dukungan.',
                'error_details' => $e->getMessage() // Opsi: Hapus di production
            ], 500);
        }
    }
}
