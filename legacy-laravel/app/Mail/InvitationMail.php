<?php

namespace App\Mail;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $invitation;
    public $ownerName;
    public $kostName;
    public $acceptUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(Invitation $invitation, string $ownerName, string $kostName)
    {
        $this->invitation = $invitation;
        $this->ownerName = $ownerName;
        $this->kostName = $kostName;
        $this->acceptUrl = config('app.frontend_url') . '/accept-invite?token=' . $invitation->token;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Undangan Bergabung ke ' . $this->kostName,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.invitation',
            with: [
                'invitation' => $this->invitation,
                'ownerName' => $this->ownerName,
                'kostName' => $this->kostName,
                'acceptUrl' => $this->acceptUrl,
            ],
        );
    }
}
