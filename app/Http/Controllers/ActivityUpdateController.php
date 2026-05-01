<?php

namespace App\Http\Controllers;

use App\Models\ActivityUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityUpdateController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->query('date') ?? now()->toDateString();

        $rows = ActivityUpdate::with(['activity','user'])
            ->where('updated_for_date', $date)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($rows);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'activity_id' => 'required|exists:activities,id',
            'status' => 'required|in:done,pending',
            'remark' => 'nullable|string',
            'updated_for_date' => 'nullable|date',
        ]);

        $row = ActivityUpdate::create(array_merge($data, [
            'user_id' => Auth::id(),
            'updated_for_date' => $data['updated_for_date'] ?? now()->toDateString(),
        ]));

        return response()->json($row, 201);
    }
}
