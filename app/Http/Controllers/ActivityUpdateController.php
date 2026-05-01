<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreActivityUpdateRequest;
use App\Models\Activity;
use App\Models\ActivityUpdate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityUpdateController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->query('date') ?: now()->toDateString();

        $updates = ActivityUpdate::with(['activity', 'user'])
            ->whereDate('updated_for_date', $date)
            ->orderByDesc('updated_for_date')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Activities/History', [
            'date' => $date,
            'updates' => $updates,
        ]);
    }

    public function store(StoreActivityUpdateRequest $request, Activity $activity): RedirectResponse
    {
        $validated = $request->validated();

        $activity->updates()->create([
            'user_id' => $request->user()->id,
            'status' => $validated['status'],
            'remark' => $validated['remark'] ?? null,
            'updated_for_date' => $validated['updated_for_date'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Activity update saved.')]);

        return to_route('activities.show', $activity);
    }
}
