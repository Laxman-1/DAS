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
    // Doctor login
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $doctor = Doctor::where('email', $data['email'])->first();

        if (!$doctor || !Hash::check($data['password'], $doctor->password)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        if (!$doctor->approve_status) {
            return response()->json(['message' => 'Your account is not approved yet.'], 403);
        }

        $token = $doctor->createToken('doctor-token')->plainTextToken;

        return response()->json([
            'role' => 'doctor',
            'token' => $token,
            'doctor' => $doctor,
        ], 200);
    }

    // Get all doctors
    public function index()
    {
        return response()->json(Doctor::all(), 200);
    }

    // Get one doctor
    public function show($id)
    {
        $doctor = Doctor::findOrFail($id);
        return response()->json($doctor, 200);
    }

    // Register doctor
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string',
            'email'            => 'required|email|unique:doctors',
            'password'         => 'required|string|min:6',
            'gender'           => 'nullable|string',
            'dob'              => 'nullable|date',
            'contact'          => 'nullable|string',
            'address'          => 'nullable|string',
            'citizenship_number' => 'nullable|string',
            'citizenship_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'passport_file'    => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'qualification'    => 'required|string',
            'specialization'   => 'required|string',
            'license_number'   => 'required|string|unique:doctors',
            'experience'       => 'required|string',
            'bio'              => 'nullable|string',
            'image'            => 'nullable|image|mimes:jpg,jpeg,png',
            'documents.*'      => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'category_id'      => 'required|exists:categories,id',
        ]);

        // Handle password
        $data['password'] = Hash::make($data['password']);
        $data['approve_status'] = false;

        // File uploads
        if ($request->hasFile('citizenship_file')) {
            $data['citizenship_file'] = $request->file('citizenship_file')->store('doctors/citizenship', 'public');
        }
        if ($request->hasFile('passport_file')) {
            $data['passport_file'] = $request->file('passport_file')->store('doctors/passport', 'public');
        }
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('doctors/profile', 'public');
        }
        if ($request->hasFile('documents')) {
            $docs = [];
            foreach ($request->file('documents') as $doc) {
                $docs[] = $doc->store('doctors/documents', 'public');
            }
            $data['documents'] = json_encode($docs);
        }

        $doctor = Doctor::create($data);

        return response()->json($doctor, 201);
    }

    // Update doctor
    public function update(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);

        $data = $request->validate([
            'name'             => 'sometimes|string',
            'email'            => 'sometimes|email|unique:doctors,email,' . $id,
            'password'         => 'sometimes|string|min:6',
            'gender'           => 'nullable|string',
            'dob'              => 'nullable|date',
            'contact'          => 'nullable|string',
            'address'          => 'nullable|string',
            'citizenship_number' => 'nullable|string',
            'citizenship_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'passport_file'    => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'qualification'    => 'sometimes|string',
            'specialization'   => 'sometimes|string',
            'license_number'   => 'sometimes|string|unique:doctors,license_number,' . $id,
            'experience'       => 'sometimes|string',
            'bio'              => 'nullable|string',
            'image'            => 'nullable|image|mimes:jpg,jpeg,png',
            'documents.*'      => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'category_id'      => 'sometimes|exists:categories,id',
            'approve_status'   => 'sometimes|boolean',
        ]);

        // Password update
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        // File uploads (replace old if new uploaded)
        if ($request->hasFile('citizenship_file')) {
            if ($doctor->citizenship_file) {
                Storage::disk('public')->delete($doctor->citizenship_file);
            }
            $data['citizenship_file'] = $request->file('citizenship_file')->store('doctors/citizenship', 'public');
        }
        if ($request->hasFile('passport_file')) {
            if ($doctor->passport_file) {
                Storage::disk('public')->delete($doctor->passport_file);
            }
            $data['passport_file'] = $request->file('passport_file')->store('doctors/passport', 'public');
        }
        if ($request->hasFile('image')) {
            if ($doctor->image) {
                Storage::disk('public')->delete($doctor->image);
            }
            $data['image'] = $request->file('image')->store('doctors/profile', 'public');
        }
        if ($request->hasFile('documents')) {
            if ($doctor->documents) {
                foreach (json_decode($doctor->documents, true) as $oldDoc) {
                    Storage::disk('public')->delete($oldDoc);
                }
            }
            $docs = [];
            foreach ($request->file('documents') as $doc) {
                $docs[] = $doc->store('doctors/documents', 'public');
            }
            $data['documents'] = json_encode($docs);
        }

        $doctor->update($data);

        return response()->json($doctor, 200);
    }

    // Delete doctor
    public function destroy($id)
    {
        $doctor = Doctor::findOrFail($id);

        // Delete files
        if ($doctor->citizenship_file) Storage::disk('public')->delete($doctor->citizenship_file);
        if ($doctor->passport_file) Storage::disk('public')->delete($doctor->passport_file);
        if ($doctor->image) Storage::disk('public')->delete($doctor->image);
        if ($doctor->documents) {
            foreach (json_decode($doctor->documents, true) as $doc) {
                Storage::disk('public')->delete($doc);
            }
        }

        $doctor->delete();

        return response()->json(['message' => 'Doctor deleted successfully'], 200);
    }

    // Approve doctor
    public function approve($id)
    {
        $doctor = Doctor::findOrFail($id);

        if (!$doctor->approve_status) {
            $doctor->approve_status = true;
            $doctor->save();

            // Send mail
            Mail::to($doctor->email)->send(new DoctorApprovedMail($doctor));
        }

        return response()->json(['message' => 'Doctor approved', 'doctor' => $doctor], 200);
    }

    // Update address
    public function updateAddress(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);

        $data = $request->validate([
            'address' => 'required|string',
        ]);

        $doctor->update(['address' => $data['address']]);

        return response()->json($doctor, 200);
    }

    // Change password
    public function changePassword(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);

        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:6|different:current_password',
        ]);

        if (!Hash::check($data['current_password'], $doctor->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $doctor->password = Hash::make($data['new_password']);
        $doctor->save();

        return response()->json(['message' => 'Password updated successfully'], 200);
    }
}
