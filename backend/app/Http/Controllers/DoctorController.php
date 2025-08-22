<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\DoctorApprovedMail;

class DoctorController extends Controller
{
    // GET all doctors
    public function index()
    {
        return response()->json(Doctor::all(), 200);
    }

    // GET a single doctor by ID
    public function show($id)
    {
        $doctor = Doctor::findOrFail($id);
        return response()->json($doctor, 200);
    }

    // CREATE a doctor
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:doctors',
            'password' => 'required|string|min:6',
            'gender' => 'nullable|string',
            'dob' => 'nullable|date',
            'contact' => 'nullable|string',
            'address' => 'nullable|string',
            'citizenship_number' => 'nullable|string',
            'citizenship_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'passport_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'qualification' => 'required|string',
            'specialization' => 'required|string',
            'license_number' => 'required|string|unique:doctors',
            'experience' => 'required|string',
            'bio' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png',
            'documents.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'category_id' => 'required|exists:categories,id',
        ]);

        // File uploads
        foreach (['citizenship_file', 'passport_file', 'image'] as $fileField) {
            if ($request->hasFile($fileField)) {
                $data[$fileField] = $request->file($fileField)->store("doctors/{$fileField}", 'public');
            }
        }

        if ($request->hasFile('documents')) {
            $docs = [];
            foreach ($request->file('documents') as $file) {
                $docs[] = $file->store('doctors/documents', 'public');
            }
            $data['documents'] = $docs;
        }

        // Hash password
        $data['password'] = Hash::make($data['password']);

        // Default approval status
        $data['approve_status'] = $request->input('approve_status', false);

        $doctor = Doctor::create($data);

        return response()->json($doctor, 201);
    }

    // UPDATE a doctor
    public function update(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:doctors,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'gender' => 'nullable|string',
            'dob' => 'nullable|date',
            'contact' => 'nullable|string',
            'address' => 'nullable|string',
            'citizenship_number' => 'nullable|string',
            'citizenship_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'passport_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'qualification' => 'sometimes|string',
            'specialization' => 'sometimes|string',
            'license_number' => 'sometimes|string|unique:doctors,license_number,' . $id,
            'experience' => 'sometimes|string',
            'bio' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png',
            'documents.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'category_id' => 'sometimes|exists:categories,id',
            'approve_status' => 'sometimes|boolean',
        ]);

        // File uploads
        foreach (['citizenship_file', 'passport_file', 'image'] as $fileField) {
            if ($request->hasFile($fileField)) {
                $data[$fileField] = $request->file($fileField)->store("doctors/{$fileField}", 'public');
            }
        }

        if ($request->hasFile('documents')) {
            $docs = [];
            foreach ($request->file('documents') as $file) {
                $docs[] = $file->store('doctors/documents', 'public');
            }
            $data['documents'] = $docs;
        }

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $doctor->update($data);

        return response()->json($doctor, 200);
    }

    // DELETE a doctor
    public function destroy($id)
    {
        $doctor = Doctor::findOrFail($id);
        $doctor->delete();

        return response()->json(['message' => 'Doctor deleted successfully'], 200);
    }

    // APPROVE a doctor and send notification email
    public function approve($id)
    {
        $doctor = Doctor::findOrFail($id);
        if (!$doctor->approve_status) {
            $doctor->approve_status = true;
            $doctor->save();

            // Send approval email using SMTP configuration
            Mail::to($doctor->email)->send(new DoctorApprovedMail($doctor));
        }

        return response()->json(['message' => 'Doctor approved', 'doctor' => $doctor], 200);
    }

    // Allow doctor to update address
    public function updateAddress(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);

        $data = $request->validate([
            'address' => 'required|string',
        ]);

        $doctor->update(['address' => $data['address']]);

        return response()->json($doctor, 200);
    }

    // Allow doctor to change password
    public function changePassword(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);

        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|different:current_password',
        ]);

        if (!Hash::check($data['current_password'], $doctor->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $doctor->password = Hash::make($data['new_password']);
        $doctor->save();

        return response()->json(['message' => 'Password updated successfully'], 200);
    }
}
