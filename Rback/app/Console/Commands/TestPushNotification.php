<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\GenericPushNotification;
use Illuminate\Console\Command;

class TestPushNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'webpush:test {user_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test push notification to a user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id');
        $user = User::find($userId);

        if (!$user) {
            $this->error("User with ID {$userId} not found.");
            return;
        }

        $this->info("Sending test notification to user: {$user->name}");
        
        $user->notify(new GenericPushNotification(
            'Test Notification',
            'This is a real-time push notification from REMINDear!',
            '/dashboard'
        ));

        $this->info('Notification sent successfully!');
    }
}
