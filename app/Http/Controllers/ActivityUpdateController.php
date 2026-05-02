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
        $search = $request->query('search');
        $status = $request->query('status');

        $updates = ActivityUpdate::with(['activity', 'user'])
            ->whereDate('updated_for_date', $date)
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
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Activities/History', [
            'date' => $date,
            'updates' => $updates,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
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
