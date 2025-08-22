<?php

use App\Http\Controllers\AppointmentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\BookingController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Category routes
Route::apiResource('categories', CategoryController::class);

// Doctor routes
Route::post('doctors/{id}/approve', [DoctorController::class, 'approve']);
Route::patch('doctors/{id}/address', [DoctorController::class, 'updateAddress']);
Route::patch('doctors/{id}/password', [DoctorController::class, 'changePassword']);
Route::apiResource('doctors', DoctorController::class);
Route::apiResource('appoinments', AppointmentController::class);
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('bookings', BookingController::class)->only(['index', 'store', 'show']);
});

// Public callback for payment gateways (GET/POST)
Route::match(['GET','POST'], 'booking/callback', [BookingController::class, 'callback'])->name('booking.callback');