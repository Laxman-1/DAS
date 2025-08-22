<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    // Create a new booking
    public function store(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'payment_method' => 'required|in:cash,khalti,esewa',
            'price' => 'required|numeric|min:0',
        ]);

        $appointment = Appointment::findOrFail($request->appointment_id);
        if ($appointment->status !== 'available') {
            return response()->json(['error' => 'Appointment is not available'], 400);
        }

        $booking = Booking::create([
            'appointment_id' => $request->appointment_id,
            'user_id' => auth()->id(),
            'price' => $request->price,
            'payment_method' => $request->payment_method,
            'payment_status' => $request->payment_method === 'cash' ? 'completed' : 'pending',
            'transaction_id' => $request->payment_method === 'cash' ? null : Str::uuid()->toString(),
        ]);

        if ($request->payment_method === 'khalti') {
            return $this->initiateKhaltiPayment($booking);
        } elseif ($request->payment_method === 'esewa') {
            return $this->initiateEsewaPayment($booking);
        }

        $appointment->update(['status' => 'booked']);

        return response()->json([
            'message' => 'Booking created successfully',
            'booking' => $booking->load('appointment', 'user'),
        ], 201);
    }

    // Initiate Khalti payment
    private function initiateKhaltiPayment(Booking $booking)
    {
        $user = auth()->user();
        $khaltiSecret = config('services.khalti.secret', env('KHALTI_SECRET'));

        $payload = [
            'return_url' => route('booking.callback'),
            'website_url' => config('app.url'),
            'amount' => (int) round($booking->price * 100), // to paisa
            'purchase_order_id' => $booking->transaction_id,
            'purchase_order_name' => 'Appointment Booking',
            'customer_info' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->contact ?? '9800000001',
            ],
            'amount_breakdown' => [
                ['label' => 'Base Price', 'amount' => (int) round(($booking->price - 10) * 100)],
                ['label' => 'Tax', 'amount' => 10 * 100],
            ],
            'product_details' => [
                [
                    'identity' => (string) $booking->id,
                    'name' => 'Doctor Appointment',
                    'total_price' => (int) round($booking->price * 100),
                    'quantity' => 1,
                    'unit_price' => (int) round($booking->price * 100),
                ],
            ],
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Key ' . $khaltiSecret,
            'Content-Type' => 'application/json',
        ])->post('https://dev.khalti.com/api/v2/epayment/initiate/', $payload);

        if ($response->successful()) {
            $data = $response->json();
            $booking->update(['transaction_id' => $data['pidx']]);
            return response()->json([
                'message' => 'Khalti payment initiated',
                'payment_url' => $data['payment_url'],
            ]);
        }

        Log::error('Khalti payment initiation failed', $response->json());
        return response()->json(['error' => 'Failed to initiate Khalti payment'], 500);
    }

    // Initiate eSewa payment
    private function initiateEsewaPayment(Booking $booking)
    {
        $testMode = config('services.esewa.test_mode', true);
        $baseUrl = $testMode ? 'https://rc-epay.esewa.com.np' : 'https://epay.esewa.com.np';
        $secretKey = config('services.esewa.secret', env('ESEWA_SECRET'));

        $transactionUuid = $booking->transaction_id;
        $totalAmount = (float) $booking->price;
        $taxAmount = 10.0;
        $amount = $totalAmount - $taxAmount;

        $message = "total_amount=$totalAmount,transaction_uuid=$transactionUuid,product_code=EPAYTEST";
        $signature = base64_encode(hash_hmac('sha256', $message, $secretKey, true));

        $formData = [
            'amount' => $amount,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
            'transaction_uuid' => $transactionUuid,
            'product_code' => 'EPAYTEST',
            'product_service_charge' => 0,
            'product_delivery_charge' => 0,
            'success_url' => route('booking.callback'),
            'failure_url' => route('booking.callback'),
            'signed_field_names' => 'total_amount,transaction_uuid,product_code',
            'signature' => $signature,
        ];

        return response()->json([
            'message' => 'eSewa payment form data',
            'form_url' => "$baseUrl/api/epay/main/v2/form",
            'form_data' => $formData,
        ]);
    }

    // Handle payment callback
    public function callback(Request $request)
    {
        $frontendUrl = config('app.frontend_url', config('app.url'));

        if ($request->has('pidx')) {
            // Khalti callback
            $booking = Booking::where('transaction_id', $request->pidx)->firstOrFail();

            $status = $this->verifyKhaltiPayment($request->pidx);
            if ($status === 'Completed') {
                $booking->update(['payment_status' => 'completed']);
                $booking->appointment->update(['status' => 'booked']);
                return redirect($frontendUrl . '/payment/success');
            }

            $booking->update(['payment_status' => 'failed']);
            return redirect($frontendUrl . '/payment/failure');
        } elseif ($request->has('data')) {
            // eSewa callback
            $data = json_decode(base64_decode($request->data), true);
            $booking = Booking::where('transaction_id', $data['transaction_uuid'])->firstOrFail();

            $status = $this->verifyEsewaPayment($booking->transaction_id, (float) $booking->price);
            if ($status === 'COMPLETE') {
                $booking->update(['payment_status' => 'completed']);
                $booking->appointment->update(['status' => 'booked']);
                return redirect($frontendUrl . '/payment/success');
            }

            $booking->update(['payment_status' => 'failed']);
            return redirect($frontendUrl . '/payment/failure');
        }

        return response()->json(['error' => 'Invalid callback'], 400);
    }

    // Verify Khalti payment
    private function verifyKhaltiPayment($pidx)
    {
        $response = Http::withHeaders([
            'Authorization' => 'key ' . config('services.khalti.secret'),
            'Content-Type' => 'application/json',
        ])->post('https://dev.khalti.com/api/v2/epayment/lookup/', ['pidx' => $pidx]);

        if ($response->successful() && $response->json()['status'] === 'Completed') {
            return 'Completed';
        }
        return $response->json()['status'] ?? 'Failed';
    }

    // Verify eSewa payment
    private function verifyEsewaPayment($transactionUuid, $totalAmount)
    {
        $baseUrl = config('services.esewa.test_mode') ? 'https://rc.esewa.com.np' : 'https://epay.esewa.com.np';
        $response = Http::get("$baseUrl/api/epay/transaction/status/", [
            'product_code' => 'EPAYTEST',
            'total_amount' => $totalAmount,
            'transaction_uuid' => $transactionUuid,
        ]);

        if ($response->successful() && $response->json()['status'] === 'COMPLETE') {
            return 'COMPLETE';
        }
        return $response->json()['status'] ?? 'FAILED';
    }

    // List bookings for authenticated user
    public function index()
    {
        $bookings = Booking::with('appointment.doctor', 'user')
            ->where('user_id', auth()->id())
            ->get();

        return response()->json($bookings);
    }

    // Show single booking
    public function show($id)
    {
        $booking = Booking::with('appointment.doctor', 'user')
            ->where('user_id', auth()->id())
            ->findOrFail($id);

        return response()->json($booking);
    }
}