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
    public function index(): Response
    {
        return Inertia::render('Activities/Index', [
            'activities' => Activity::query()
                ->with(['createdBy', 'updates.user'])
                ->latest()
                ->get(),
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
        ]);

        $start = $validated['start'] ?? now()->startOfMonth()->toDateString();
        $end = $validated['end'] ?? now()->toDateString();

        $updates = ActivityUpdate::with(['activity', 'user'])
            ->whereDate('updated_for_date', '>=', $start)
            ->whereDate('updated_for_date', '<=', $end)
            ->orderByDesc('updated_for_date')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Activities/Reports', [
            'start' => $start,
            'end' => $end,
            'updates' => $updates,
        ]);
    }
}

