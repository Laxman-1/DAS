<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\BookingController;

// User Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::get('appointments/doctor/{doctorId}', [AppointmentController::class, 'getByDoctor']);
use App\Http\Controllers\UserController;
Route::get('appointments/doctor/{doctorId}', [AppointmentController::class, 'getByDoctor']);
use App\Http\Controllers\KhaltiController;
use App\Http\Controllers\RecommendController;

Route::post('khalti/initiate', [KhaltiController::class, 'initiatePayment']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('bookings', [BookingController::class, 'store']);
    Route::post('bookings/{bookingId}/initiate-esewa', [BookingController::class, 'initiateEsewa']);
    Route::post('bookings/check-esewa-status', [BookingController::class, 'checkEsewaStatus']);
    Route::get('bookings/callback', [BookingController::class, 'callback'])->name('booking.callback');
    Route::post('bookings/callback', [BookingController::class, 'callback'])->name('booking.callback');
    Route::get('bookings', [BookingController::class, 'index']);
    Route::get('bookings/{id}', [BookingController::class, 'show']);
});


Route::get('appointments/doctor/{doctorId}', [AppointmentController::class, 'getByDoctorWithPatient']);

Route::get('/test-signature', function () {
    $message = "total_amount=110.00,transaction_uuid=241028,product_code=EPAYTEST";
    $secret = '8gBm/:&EnhH.1/q(';
    $signature = base64_encode(hash_hmac('sha256', $message, $secret, true));
    return ['message' => $message, 'signature' => $signature];
});
Route::post('/login', [UserController::class, 'login']); // user login
Route::apiResource('users', UserController::class);     // CRUD users

// User Management Routes
Route::apiResource('users', UserController::class);

// Category Routes
Route::apiResource('categories', CategoryController::class);
Route::get('doctors/with-available-appointments', [AppointmentController::class, 'doctorsWithAvailableAppointments']);


Route::post('/predict-specialist', [RecommendController::class, 'predict']);

// Doctor Routes
Route::post('doctors/login', [DoctorController::class, 'login']);
Route::post('doctors/{id}/approve', [DoctorController::class, 'approve']);
Route::patch('doctors/{id}/address', [DoctorController::class, 'updateAddress']);
Route::patch('doctors/{id}/password', [DoctorController::class, 'changePassword']);
Route::apiResource('doctors', DoctorController::class);

// Appointment Routes
Route::apiResource('appointments', AppointmentController::class);

// Booking Routes (Protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('bookings', BookingController::class)->only(['index', 'store', 'show']);
});

// Public callback for payment gateways
Route::match(['GET','POST'], 'booking/callback', [BookingController::class, 'callback'])
    ->name('booking.callback');
