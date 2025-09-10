<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class KhaltiController extends Controller
{
    private $sandboxKey = 'YOUR_SANDBOX_SECRET_KEY';

    public function initiatePayment(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:100', // amount in paisa
            'purchase_order_id' => 'required|string',
            'purchase_order_name' => 'required|string',
            'return_url' => 'required|url'
        ]);

        $payload = [
            "return_url" => $request->return_url,
            "website_url" => url('/'),
            "amount" => $request->amount,
            "purchase_order_id" => $request->purchase_order_id,
            "purchase_order_name" => $request->purchase_order_name,
            "customer_info" => [
                "name" => $request->user()->name ?? "Guest",
                "email" => $request->user()->email ?? "",
                "phone" => $request->user()->phone ?? ""
            ]
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Key ' . $this->sandboxKey,
            'Content-Type' => 'application/json'
        ])->post('https://dev.khalti.com/api/v2/epayment/initiate/', $payload);

        return $response->json();
    }
}
