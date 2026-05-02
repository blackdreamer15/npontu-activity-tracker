<?php

namespace App\Console\Commands;

use App\Models\Activity;
use App\Models\ActivityUpdate;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SeedDemoData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:seed-demo 
                            {--users=3 : Number of users to create} 
                            {--days=14 : Number of days of history} 
                            {--activities=5 : Activities per user}
                            {--clean : Wipe existing activities and updates before seeding}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed the database with flexible demo data for testing and presentations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userCount = (int) $this->option('users');
        $dayCount = (int) $this->option('days');
        $activitiesPerUser = (int) $this->option('activities');

        $this->info("Starting demo seeding...");
        $this->info("Configuration: {$userCount} users, {$activitiesPerUser} activities/user, {$dayCount} days of history.");

        if ($this->option('clean')) {
            $this->warn("Cleaning existing activities and updates...");
            ActivityUpdate::truncate();
            Activity::truncate();
        }

        $faker = \Faker\Factory::create('en_GH');

        $ghanaianNames = [
            'Kwame Mensah', 'Abena Owusu', 'Kofi Appiah', 'Ama Serwaa', 'Yaw Boateng', 
            'Akosua Adjei', 'Kwesi Forson', 'Esi Osei', 'Kojo Antwi', 'Araba Quansah',
            'Nii Armah', 'Naa Lamiley', 'Kweku Baako', 'Adjoa Safo', 'Paapa Yankson'
        ];

        // 1. Create/Ensure Users
        $users = [];
        for ($i = 1; $i <= $userCount; $i++) {
            $name = $i <= count($ghanaianNames) ? $ghanaianNames[$i-1] : $faker->name;
            $email = Str::slug($name, '.') . '@shinkuro.com';
            
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password@123#'),
                    'email_verified_at' => now(),
                ]
            );
            $users[] = $user;
            $this->line(" - Prepared user: {$email} ({$name})");
        }

        $activityTemplates = [
            'Daily SMS count in comparison to logs', 'Mobile Money Settlement Audit', 'USSD Gateway Health Check',
            'Bank Switch Reconciliation', 'Airtime Top-up Verification', 'Merchant Payment Log Audit',
            'Customer KYC Compliance Check', 'System Resource Utilization Audit', 'Database Replication Sync',
            'GWCL Billing Verification', 'Kibi Regional Server Audit', 'Kumasi Data Center Maintenance',
            'Accra Head Office Security Check', 'Takoradi Port Logistics Log', 'Tamale Branch Connectivity',
            'Ghana Gov Gateway Sync', 'GRA Tax Portal Verification'
        ];

        $bar = $this->output->createProgressBar(count($users) * $activitiesPerUser);
        $bar->start();

        foreach ($users as $user) {
            for ($j = 0; $j < $activitiesPerUser; $j++) {
                $title = null;
                try {
                    $title = $faker->unique()->randomElement($activityTemplates);
                } catch (\OverflowException $e) {
                    $title = $faker->randomElement($activityTemplates) . " " . ($j + 1);
                }
                
                $activity = Activity::create([
                    'title' => $title,
                    'description' => $faker->sentence(12),
                    'created_by' => $user->id,
                    'is_active' => true,
                ]);

                // Create updates for the last X days
                for ($d = 0; $d < $dayCount; $d++) {
                    $date = Carbon::today()->subDays($d);
                    
                    // Randomize status and timing
                    $status = $faker->randomElement(['done', 'done', 'done', 'pending']); // 75% done
                    $remark = $status === 'done' 
                        ? $faker->randomElement(['Completed successfully', 'Verified and cleared', 'All checks passed', 'Status: Green'])
                        : $faker->randomElement(['Review in progress', 'Pending verification', 'Issues identified, investigating', 'Waiting for system logs']);

                    ActivityUpdate::create([
                        'activity_id' => $activity->id,
                        'user_id' => $user->id,
                        'status' => $status,
                        'remark' => $remark,
                        'updated_for_date' => $date->toDateString(),
                        'created_at' => $date->copy()->setTime(rand(8, 18), rand(0, 59)),
                    ]);
                }
                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine();
        $this->info("Seeding completed successfully!");
        $this->table(['Metric', 'Count'], [
            ['Users', User::count()],
            ['Activities', Activity::count()],
            ['Total Updates', ActivityUpdate::count()],
        ]);
        
        $this->info("Login info: Use any 'userX@example.com' with password 'password'");
    }
}
