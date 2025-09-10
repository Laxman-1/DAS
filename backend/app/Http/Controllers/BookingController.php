<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Appointment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    // Create a new booking
    public function store(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'payment_method' => 'required|in:cash,esewa',
            'price' => 'required|numeric|min:0',
            'transaction_id' => 'nullable|string|unique:bookings,transaction_id',
            'user_id' => 'required|exists:users,id', // Validate user_id from request
        ]);

        return DB::transaction(function () use ($request) {
            $appointment = Appointment::lockForUpdate()->findOrFail($request->appointment_id);
            Log::info('Booking attempt', [
                'appointment_id' => $request->appointment_id,
                'appointment_status' => $appointment->status,
                'user_id' => $request->user_id,
                'request' => $request->all(),
            ]);

            if ($appointment->status !== 'available') {
                return response()->json(['error' => 'Appointment is not available'], 400);
            }

            $booking = Booking::create([
                'appointment_id' => $request->appointment_id,
                'user_id' => $request->user_id, // Use user_id from request
                'price' => (float) $request->price,
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'cash' ? 'completed' : 'pending',
                'transaction_id' => $request->payment_method === 'cash' ? null : ($request->transaction_id ?? Str::uuid()->toString()),
            ]);

            if ($request->payment_method === 'cash') {
                $appointment->update(['status' => 'booked']);
                return response()->json([
                    'message' => 'Booking created successfully',
                    'booking' => $booking->load('appointment', 'user'),
                ], 201);
            }

            return response()->json([
                'message' => 'Booking created, proceed to payment',
                'booking_id' => $booking->id,
            ], 201);
        });
    }

    // Initiate eSewa payment
    public function initiateEsewa(Request $request, $bookingId)
    {
        $booking = Booking::findOrFail($bookingId);
        if ($booking->payment_method !== 'esewa' || $booking->payment_status !== 'pending') {
            return response()->json(['error' => 'Invalid booking or payment status'], 400);
        }

        $testMode = config('services.esewa.test_mode', true);
        $initUrl = $testMode ? 'https://rc-epay.esewa.com.np' : 'https://epay.esewa.com.np';
        $secretKey = config('services.esewa.secret', env('ESEWA_SECRET'));

        if (!$secretKey) {
            Log::error('eSewa secret key not configured');
            return response()->json(['error' => 'Payment configuration error'], 500);
        }

        $transactionUuid = $booking->transaction_id;
        $totalAmount = sprintf('%.2f', (float) $booking->price);
        $taxAmount = sprintf('%.2f', 10.00);
        $amount = sprintf('%.2f', (float) $totalAmount - (float) $taxAmount);

        $message = "total_amount=$totalAmount,transaction_uuid=$transactionUuid,product_code=EPAYTEST";
        Log::info('eSewa signature generation', [
            'message' => $message,
            'secret' => substr($secretKey, 0, 4) . '****',
        ]);
        $signature = base64_encode(hash_hmac('sha256', $message, $secretKey, true));
        Log::info('eSewa generated signature', ['signature' => $signature]);

        $formData = [
            'amount' => $amount,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
            'transaction_uuid' => $transactionUuid,
            'product_code' => 'EPAYTEST',
            'product_service_charge' => '0.00',
            'product_delivery_charge' => '0.00',
            'success_url' => config('app.frontend_url', 'http://localhost:5173') . '/paymentsuccess',
            'failure_url' => config('app.frontend_url', 'http://localhost:5173') . '/paymentfailure',
            'signed_field_names' => 'total_amount,transaction_uuid,product_code',
            'signature' => $signature,
        ];

        Log::info('eSewa form data', ['form_data' => $formData]);

        return response()->json([
            'message' => 'eSewa payment form data',
            'form_url' => "$initUrl/api/epay/main/v2/form",
            'form_data' => $formData,
        ], 200);
    }

    // Handle payment callback
    public function callback(Request $request)
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        if ($request->has('data')) {
            $data = json_decode(base64_decode($request->data), true);
            if (!$data || !isset($data['transaction_uuid'])) {
                Log::error('eSewa callback: Invalid data', ['data' => $request->data]);
                return redirect($frontendUrl . '/paymentfailure?error=' . urlencode('Invalid callback data'));
            }

            $booking = Booking::where('transaction_id', $data['transaction_uuid'])->first();
            if (!$booking) {
                Log::error('eSewa callback: Booking not found', ['transaction_uuid' => $data['transaction_uuid']]);
                return redirect($frontendUrl . '/paymentfailure?error=' . urlencode('Booking not found'));
            }

            $status = $this->verifyEsewaPayment($booking->transaction_id, (float) $booking->price);
            if ($status === 'COMPLETE') {
                $booking->update(['payment_status' => 'completed']);
                $booking->appointment->update(['status' => 'booked']);
                return redirect($frontendUrl . '/paymentsuccess?data=' . urlencode($request->data));
            }

            $booking->update(['payment_status' => 'failed']);
            return redirect($frontendUrl . '/paymentfailure?error=' . urlencode('Payment verification failed: ' . $status));
        }

        Log::error('Invalid callback request', $request->all());
        return redirect($frontendUrl . '/paymentfailure?error=' . urlencode('Invalid callback'));
    }

    // Verify eSewa payment
    private function verifyEsewaPayment($transactionUuid, $totalAmount)
    {
        $testMode = config('services.esewa.test_mode', true);
        $verifyUrl = $testMode ? 'https://rc.esewa.com.np' : 'https://esewa.com.np';
        $totalAmountFormatted = sprintf('%.2f', (float) $totalAmount);

        try {
            $response = Http::get("$verifyUrl/api/epay/transaction/status/", [
                'product_code' => 'EPAYTEST',
                'total_amount' => $totalAmountFormatted,
                'transaction_uuid' => $transactionUuid,
            ]);

            Log::info('eSewa verification request', [
                'url' => "$verifyUrl/api/epay/transaction/status/",
                'params' => [
                    'product_code' => 'EPAYTEST',
                    'total_amount' => $totalAmountFormatted,
                    'transaction_uuid' => $transactionUuid,
                ],
                'response' => $response->json(),
            ]);

            if ($response->successful() && $response->json()['status'] === 'COMPLETE') {
                return 'COMPLETE';
            }

            return $response->json()['status'] ?? 'FAILED';
        } catch (\Exception $e) {
            Log::error('eSewa verification error', ['error' => $e->getMessage()]);
            return 'FAILED';
        }
    }

    // Check eSewa payment status (for manual verification)
    public function checkEsewaStatus(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::findOrFail($request->booking_id);
        if ($booking->payment_method !== 'esewa' || !$booking->transaction_id) {
            return response()->json(['error' => 'Invalid booking or payment method'], 400);
        }

        $status = $this->verifyEsewaPayment($booking->transaction_id, (float) $booking->price);
        if ($status === 'COMPLETE') {
            $booking->update(['payment_status' => 'completed']);
            $booking->appointment->update(['status' => 'booked']);
            return response()->json(['message' => 'Payment verified successfully', 'status' => 'completed'], 200);
        }

        $booking->update(['payment_status' => 'failed']);
        return response()->json(['message' => 'Payment verification failed', 'status' => $status], 400);
    }

    // List bookings for authenticated user
    public function index()
    {
        $bookings = Booking::with('appointment.doctor', 'user')
            ->where('user_id', auth()->id())
            ->get();

        return response()->json($bookings, 200);
    }

    // Show single booking
    public function show($id)
    {
        $booking = Booking::with('appointment.doctor', 'user')
            ->where('user_id', auth()->id())
            ->findOrFail($id);

        return response()->json($booking, 200);
    }
}