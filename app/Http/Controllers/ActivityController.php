<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    public function index()
    {
        return response()->json(Activity::with(['createdBy','updates.user'])->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $activity = Activity::create(array_merge($data, ['created_by' => Auth::id()]));

        return response()->json($activity, 201);
    }

    public function show(Activity $activity)
    {
        $activity->load(['createdBy','updates.user']);
        return response()->json($activity);
    }

    public function update(Request $request, Activity $activity)
    {
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $activity->update($data);

        return response()->json($activity);
    }

    public function destroy(Activity $activity)
    {
        $activity->delete();
        return response()->json(null, 204);
    }

    public function report(Request $request)
    {
        $data = $request->validate([
            'start' => 'required|date',
            'end' => 'required|date',
        ]);

        $rows = ActivityUpdate::with(['activity','user'])
            ->whereBetween('updated_for_date', [$data['start'], $data['end']])
            ->orderBy('updated_for_date')
            ->get();

        return response()->json($rows);
    }
}
