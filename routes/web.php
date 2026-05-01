<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ActivityUpdateController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'show'])->name('dashboard');

    Route::get('activities', [ActivityController::class, 'index'])->name('activities.index');
    Route::post('activities', [ActivityController::class, 'store'])->name('activities.store');
    Route::get('activities/history', [ActivityUpdateController::class, 'index'])->name('activities.history');
    Route::get('activities/{activity}', [ActivityController::class, 'show'])
        ->whereNumber('activity')
        ->name('activities.show');
    Route::put('activities/{activity}', [ActivityController::class, 'update'])
        ->whereNumber('activity')
        ->name('activities.update');
    Route::delete('activities/{activity}', [ActivityController::class, 'destroy'])
        ->whereNumber('activity')
        ->name('activities.destroy');
    Route::post('activities/{activity}/updates', [ActivityUpdateController::class, 'store'])
        ->whereNumber('activity')
        ->name('activities.updates.store');

    Route::get('reports/activities', [ActivityController::class, 'report'])->name('activities.reports');
});

// health check for containers / load balancers
Route::get('/healthz', fn () => response()->json(['status' => 'ok'], 200));

require __DIR__.'/settings.php';
