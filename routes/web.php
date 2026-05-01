<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ActivityUpdateController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    
    Route::get('activities', [ActivityController::class, 'index']);
    Route::post('activities', [ActivityController::class, 'store']);
    Route::get('activities/{activity}', [ActivityController::class, 'show']);
    Route::put('activities/{activity}', [ActivityController::class, 'update']);
    Route::delete('activities/{activity}', [ActivityController::class, 'destroy']);

    Route::get('activity-updates', [ActivityUpdateController::class, 'index']);
    Route::post('activity-updates', [ActivityUpdateController::class, 'store']);

    Route::get('reports', [ActivityController::class, 'report'])->name('activities.report');
});

require __DIR__.'/settings.php';
