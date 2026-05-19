<?php

namespace App\Mail;

use App\Models\Cs;
use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CsSelectionConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Cs $cs,
        public Vendor $vendor,
        public array $items,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Selection Confirmation — ' . $this->cs->tender->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.cs-selection-confirmation',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
