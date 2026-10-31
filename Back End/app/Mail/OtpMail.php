<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Kode OTP yang akan dikirim.
     */
    public $otpCode;
    public $subjectLine;

    /**
     * Create a new message instance.
     *
     * @param string $otpCode
     * @param string $subjectLine
     * @return void
     */
    public function __construct(string $otpCode, string $subjectLine = 'Kode Verifikasi OTP Anda')
    {
        $this->otpCode = $otpCode;
        $this->subjectLine = $subjectLine;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectLine,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.otp', // Kita buat view ini di langkah berikutnya
            with: [
                'otp' => $this->otpCode,
            ],
        );
    }
}
