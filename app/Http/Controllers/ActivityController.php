<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Models\Activity;
use App\Models\ActivityUpdate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $lifecycle = $request->input('lifecycle');
        $status = $request->input('status');

        $activities = Activity::query()
            ->with(['createdBy', 'latestUpdate.user'])
            ->withCount(['updates' => function ($query) {
                $query->whereDate('updated_for_date', now()->toDateString())
                    ->where('status', 'done');
            }])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($lifecycle, function ($query, $lifecycle) {
                if ($lifecycle === 'active') $query->where('is_active', true);
                if ($lifecycle === 'inactive') $query->where('is_active', false);
            })
            ->when($status, function ($query, $status) {
                if ($status === 'done') {
                    $query->whereHas('updates', function ($q) {
                        $q->whereDate('updated_for_date', now()->toDateString())
                            ->where('status', 'done');
                    });
                } elseif ($status === 'pending') {
                    $query->where(function ($q) {
                        $q->whereDoesntHave('updates', function ($sq) {
                            $sq->whereDate('updated_for_date', now()->toDateString());
                        })->orWhereHas('updates', function ($sq) {
                            $sq->whereDate('updated_for_date', now()->toDateString())
                                ->where('status', 'pending');
                        });
                    });
                }
            })
            ->latest()
            ->get()
            ->map(function ($activity) {
                // Determine today's status manually for the badge
                $todayUpdate = $activity->updates()
                    ->whereDate('updated_for_date', now()->toDateString())
                    ->first();
                
                $activity->today_status = $todayUpdate ? $todayUpdate->status : 'pending';
                return $activity;
            });

        return Inertia::render('Activities/Index', [
            'activities' => $activities,
            'filters' => [
                'search' => $search,
                'lifecycle' => $lifecycle,
                'status' => $status,
            ],
        ]);
    }

    public function store(StoreActivityRequest $request): RedirectResponse
    {
        Activity::create(array_merge($request->validated(), ['created_by' => $request->user()->id]));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Activity created.')]);

        return to_route('activities.index');
    }

    public function show(Activity $activity): Response
    {
        $activity->load(['createdBy', 'updates.user']);

        return Inertia::render('Activities/Show', [
            'activity' => $activity,
        ]);
    }

    public function update(UpdateActivityRequest $request, Activity $activity): RedirectResponse
    {
        $activity->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Activity updated.')]);

        return to_route('activities.show', $activity);
    }

    public function destroy(Activity $activity): RedirectResponse
    {
        $activity->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Activity deleted.')]);

        return to_route('activities.index');
    }

    public function report(Request $request): Response
    {
        $validated = $request->validate([
            'start' => 'nullable|date',
            'end' => 'nullable|date|after_or_equal:start',
            'search' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $start = $validated['start'] ?? now()->startOfMonth()->toDateString();
        $end = $validated['end'] ?? now()->toDateString();
        $search = $validated['search'] ?? null;
        $status = $validated['status'] ?? null;

        $updates = ActivityUpdate::with(['activity', 'user'])
            ->whereDate('updated_for_date', '>=', $start)
            ->whereDate('updated_for_date', '<=', $end)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('activity', function ($aq) use ($search) {
                        $aq->where('title', 'like', "%{$search}%");
                    })->orWhere('remark', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderByDesc('updated_for_date')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Activities/Reports', [
            'start' => $start,
            'end' => $end,
            'updates' => $updates,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }
}

