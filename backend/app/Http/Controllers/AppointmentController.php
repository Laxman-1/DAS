<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Booking;
use App\Models\Doctor;

class AppointmentController extends Controller
{
    // List all appointments
    public function index()
    {
        return response()->json(Appointment::with('doctor')->get());
    }

    // Create new appointment
    public function store(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'status' => 'sometimes|in:available,booked,break',
            'service_charge' => 'nullable|numeric|min:0',
        ]);

        $appointment = Appointment::create([
            'doctor_id' => $request->doctor_id,
            'appointment_date' => $request->appointment_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => $request->status ?? 'available',
            'service_charge' => $request->service_charge,
        ]);

        return response()->json([
            'message' => 'Appointment created successfully',
            'appointment' => $appointment->load('doctor')
        ], 201);
    }

    // Show single appointment
    public function show($id)
    {
        $appointment = Appointment::with('doctor')->findOrFail($id);
        return response()->json($appointment);
    }

    // Update appointment
    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $request->validate([
            'doctor_id' => 'sometimes|exists:doctors,id',
            'appointment_date' => 'sometimes|date',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
            'status' => 'sometimes|in:available,booked,break',
            'service_charge' => 'nullable|numeric|min:0',
        ]);

        $appointment->update($request->only([
            'doctor_id',
            'appointment_date',
            'start_time',
            'end_time',
            'status',
            'service_charge'
        ]));

        return response()->json([
            'message' => 'Appointment updated successfully',
            'appointment' => $appointment->load('doctor')
        ]);
    }

    // Delete appointment
    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        return response()->json(['message' => 'Appointment deleted successfully']);
    }

    // Get all appointments for a specific doctor
    public function getByDoctor($doctorId)
    {
        $appointments = Appointment::with('doctor')
            ->where('doctor_id', $doctorId)
            ->get();

        return response()->json($appointments);
    }

    // Get all appointments booked by a specific user
    public function getByUser($userId)
    {
        $appointments = Appointment::with(['doctor', 'booking' => function ($query) use ($userId) {
            $query->where('user_id', $userId);
        }])
        ->whereHas('booking', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->get();

        return response()->json($appointments);
    }
}