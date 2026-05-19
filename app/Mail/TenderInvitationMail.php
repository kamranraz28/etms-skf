<?php

namespace App\Mail;

use App\Models\Tender;
use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TenderInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Tender $tender,
        public Vendor $vendor,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tender Invitation — ' . $this->tender->tender_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.tender-invitation',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
