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
    /**
     * Resolve "today" in the user's local timezone.
     */
    private function today(): string
    {
        return now()->toDateString();
    }

    public function index(Request $request): Response
    {
        $search    = $request->input('search');
        $lifecycle = $request->input('lifecycle');
        $status    = $request->input('status');
        $today     = $this->today();

        $activities = Activity::query()
            ->with(['createdBy', 'latestUpdate.user'])
            ->withCount(['updates as today_done_count' => function ($query) use ($today) {
                $query->whereDate('updated_for_date', $today)
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
            ->when($status, function ($query, $status) use ($today) {
                if ($status === 'done') {
                    $query->whereHas('updates', function ($q) use ($today) {
                        $q->whereDate('updated_for_date', $today)->where('status', 'done');
                    });
                } elseif ($status === 'pending') {
                    $query->where(function ($q) use ($today) {
                        $q->whereDoesntHave('updates', function ($sq) use ($today) {
                            $sq->whereDate('updated_for_date', $today);
                        })->orWhereHas('updates', function ($sq) use ($today) {
                            $sq->whereDate('updated_for_date', $today)->where('status', 'pending');
                        });
                    });
                }
            })
            ->latest()
            ->paginate(10)
            ->through(function ($activity) {
                $activity->today_status = $activity->today_done_count > 0 ? 'done' : 'pending';
                return $activity;
            });

        return Inertia::render('Activities/Index', [
            'activities' => $activities,
            'filters'    => [
                'search'    => $search,
                'lifecycle' => $lifecycle,
                'status'    => $status,
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
            'start'  => 'nullable|date',
            'end'    => 'nullable|date|after_or_equal:start',
            'search' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $today  = $this->today();
        $start  = $validated['start'] ?? now()->startOfMonth()->toDateString();
        $end    = $validated['end'] ?? $today;
        $search = $validated['search'] ?? null;
        $status = $validated['status'] ?? null;

        $query = ActivityUpdate::with(['activity', 'user'])
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
            });

        $doneCount = (clone $query)->where('status', 'done')->count();
        $pendingCount = (clone $query)->where('status', 'pending')->count();

        $updates = $query->orderByDesc('updated_for_date')
            ->orderByDesc('created_at')
            ->paginate(10);

        return Inertia::render('Activities/Reports', [
            'start'   => $start,
            'end'     => $end,
            'updates' => $updates,
            'done_count' => $doneCount,
            'pending_count' => $pendingCount,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }
}
