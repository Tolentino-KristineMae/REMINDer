<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class GenericPushNotification extends Notification
{
    use Queueable;

    public $title;
    public $body;
    public $url;

    /**
     * Create a new notification instance.
     */
    public function __construct($title, $body, $url = '/')
    {
        $this->title = $title;
        $this->body = $body;
        $this->url = $url;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    /**
     * Get the web push representation of the notification.
     */
    public function toWebPush($notifiable, $notification)
    {
        return (new WebPushMessage)
            ->title($this->title)
            ->icon('/favicon.svg')
            ->body($this->body)
            ->action('View Details', 'view_details')
            ->data(['url' => $this->url]);
    }
}
