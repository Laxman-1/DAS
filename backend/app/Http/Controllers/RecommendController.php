<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Doctor;
use App\Models\Category;
use Carbon\Carbon;

class RecommendController extends Controller
{
    public function predict(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'symptoms' => 'required|string|min:5',
            'disease'  => 'nullable|string'
        ]);

        try {
            // Call Python NLP microservice
            $response = Http::timeout(30)->post('http://127.0.0.1:5001/nlp/analyze', [
                'symptoms' => $validated['symptoms'],
                'disease'  => $validated['disease'] ?? ''
            ]);

            if (!$response->successful()) {
                Log::error('Python service error', [
                    'status'   => $response->status(),
                    'response' => $response->body(),
                ]);
                return response()->json([
                    'error'   => 'Prediction service unavailable',
                    'details' => $response->body(),
                ], 503);
            }

            $predictionData = $response->json();
            
            // Get the recommended specialist category from Flask
            $specialistCategory = $predictionData['recommended_specialist_category'] ?? null;

            if (!$specialistCategory) {
                return response()->json([
                    'success' => false,
                    'error'   => 'No specialist category returned from prediction service'
                ], 422);
            }

            // Debug: Log what we received from Flask
            Log::info('Flask recommendation', [
                'specialist_category' => $specialistCategory,
                'full_response' => $predictionData
            ]);

            // First try to find by exact match on the 'category' column
            $category = Category::where('category', $specialistCategory)->first();

            // If not found, try case-insensitive search
            if (!$category) {
                $category = Category::whereRaw('LOWER(category) = ?', [strtolower($specialistCategory)])->first();
            }

            // If still not found, try partial match
            if (!$category) {
                $category = Category::where('category', 'like', "%$specialistCategory%")->first();
            }

            if (!$category) {
                Log::error('Category not found', [
                    'recommended_category' => $specialistCategory,
                    'available_categories' => Category::pluck('category')->toArray()
                ]);
                
                return response()->json([
                    'success'     => false,
                    'error'       => 'No matching specialist category found',
                    'recommended_category' => $specialistCategory,
                    'available_categories' => Category::pluck('category')->toArray()
                ], 404);
            }

            // Get doctors with available appointments
            $currentTime = Carbon::now('Asia/Kathmandu'); // Current time: 01:12 AM +0545, September 08, 2025
            $doctors = Doctor::where('category_id', $category->id)
                             ->where('approve_status', true) // Only approved doctors
                             ->with(['appointments' => function ($query) use ($currentTime) {
                                 $query->where('status', 'available')
                                       ->where('appointment_date', '>=', $currentTime->toDateString())
                                       ->where('start_time', '>=', $currentTime->format('H:i:s'))
                                       ->orderBy('appointment_date')
                                       ->orderBy('start_time');
                             }])
                             ->get()
                             ->filter(function ($doctor) {
                                 return $doctor->appointments->isNotEmpty();
                             });

            // Include category relationship for each doctor
            $doctors->each(function ($doctor) {
                $doctor->load('category');
            });

            return response()->json([
                'success'                        => true,
                'prediction'                     => $predictionData,
                'recommended_specialist_category'=> $specialistCategory,
                'category'                       => $category,
                'doctors'                        => $doctors->values() // Reindex array after filtering
            ]);

        } catch (\Exception $e) {
            Log::error('Prediction failed', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
                'request_data' => $validated
            ]);

            return response()->json([
                'error'   => 'Prediction failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}