<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityUpdate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function show(): Response
    {
        $today = now()->toDateString();
        $sevenDaysAgo = now()->subDays(7)->toDateString();

        // Get all activities with recent updates
        $activities = Activity::query()
            ->with(['updates.user', 'createdBy'])
            ->latest()
            ->get();

        // Today's updates
        $todayUpdates = ActivityUpdate::query()
            ->with(['activity', 'user'])
            ->whereDate('updated_for_date', $today)
            ->orderByDesc('created_at')
            ->limit(6)
            ->get();

        // Metrics
        $totalActivities = $activities->count();
        $activeActivities = $activities->where('is_active', true)->count();
        $todayUpdateCount = ActivityUpdate::whereDate('updated_for_date', $today)->count();
        $todayDoneCount = ActivityUpdate::whereDate('updated_for_date', $today)
            ->where('status', 'done')
            ->count();

        // Chart data: Daily activity volume (last 7 days)
        $dailyVolume = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $count = ActivityUpdate::whereDate('updated_for_date', $date)->count();
            $dailyVolume[] = [
                'date' => now()->subDays($i)->format('M d'),
                'updates' => $count,
            ];
        }

        // Chart data: Completion rate trend (last 7 days)
        $completionTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $total = ActivityUpdate::whereDate('updated_for_date', $date)->count();
            $done = ActivityUpdate::whereDate('updated_for_date', $date)
                ->where('status', 'done')
                ->count();
            $rate = $total > 0 ? round(($done / $total) * 100) : 0;
            $completionTrend[] = [
                'date' => now()->subDays($i)->format('M d'),
                'completed' => $rate,
            ];
        }

        // Chart data: Status breakdown (all time)
        $allDone = ActivityUpdate::where('status', 'done')->count();
        $allPending = ActivityUpdate::where('status', 'pending')->count();
        $statusBreakdown = [
            ['name' => 'Done', 'value' => $allDone, 'fill' => '#10b981'],
            ['name' => 'Pending', 'value' => $allPending, 'fill' => '#f59e0b'],
        ];

        // Chart data: Activity completion breakdown
        $activityBreakdown = $activities->map(function ($activity) {
            $done = $activity->updates->where('status', 'done')->count();
            $pending = $activity->updates->where('status', 'pending')->count();
            return [
                'name' => $activity->title,
                'done' => $done,
                'pending' => $pending,
            ];
        })->values()->take(5)->toArray();

        return Inertia::render('dashboard', [
            'metrics' => [
                'totalActivities' => $totalActivities,
                'activeActivities' => $activeActivities,
                'todayUpdates' => $todayUpdateCount,
                'todayCompleted' => $todayDoneCount,
            ],
            'todayUpdates' => $todayUpdates,
            'charts' => [
                'dailyVolume' => $dailyVolume,
                'completionTrend' => $completionTrend,
                'statusBreakdown' => $statusBreakdown,
                'activityBreakdown' => $activityBreakdown,
            ],
        ]);
    }
}
