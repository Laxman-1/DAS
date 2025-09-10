<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment;

class AppointmentController extends Controller
{
    public function index()
    {
        return response()->json(Appointment::with('doctor')->get());
    }

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

        $appointment = Appointment::create($request->only([
            'doctor_id', 'appointment_date', 'start_time', 'end_time', 'status', 'service_charge'
        ]));

        return response()->json([
            'message' => 'Appointment created successfully',
            'appointment' => $appointment->load('doctor')
        ], 201);
    }

    public function show($id)
    {
        return response()->json(Appointment::with('doctor')->findOrFail($id));
    }

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
            'doctor_id', 'appointment_date', 'start_time', 'end_time', 'status', 'service_charge'
        ]));

        return response()->json([
            'message' => 'Appointment updated successfully',
            'appointment' => $appointment->load('doctor')
        ]);
    }

    public function destroy($id)
    {
        Appointment::findOrFail($id)->delete();
        return response()->json(['message' => 'Appointment deleted successfully']);
    }

    // **Custom method to get appointments by doctor**
    public function getByDoctor($doctorId)
    {
        $appointments = Appointment::with('doctor')
            ->where('doctor_id', $doctorId)
            ->get();

        return response()->json($appointments);
    }

    // Get appointments of a specific doctor along with patient info
public function getByDoctorWithPatient($doctorId)
{
    $appointments = Appointment::with(['booking.user']) // Load patient info
        ->where('doctor_id', $doctorId)
        ->get();

    return response()->json($appointments);
}

// Get all doctors who have available appointments
// Get all doctors who have available (not booked) appointments
public function doctorsWithAvailableAppointments()
{
    $doctors = \App\Models\Doctor::where('approve_status', true) // only approved doctors
        ->whereHas('appointments', function ($query) {
            $query->where('status', 'available'); // only free slots
        })
        ->with(['appointments' => function ($query) {
            $query->where('status', 'available'); // load only free slots
        }])
        ->get();

    return response()->json($doctors, 200);
}


}
