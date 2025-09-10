<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{


     public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        // Generate API token (using Laravel Sanctum recommended)
        $token = $user->createToken('userToken')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user,
            'role'  => $user->role
        ], 200);
    }
    // Get all users
    public function index()
    {
        return response()->json(User::all(), 200);
    }

    // Get one user
    public function show($id)
    {
        return response()->json(User::findOrFail($id), 200);
    }

    // Create
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'role' => 'required|in:system_admin,admin,doctor,patient',
            'gender' => 'nullable|string',
            'dob' => 'nullable|date',
            'contact' => 'nullable|string',
            'emergency_contact' => 'nullable|string',
            'email' => 'required|email|unique:users',
            'address' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);
        return response()->json($user, 201);
    }

    // Update
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string',
            'role' => 'sometimes|in:system_admin,admin,doctor,patient',
            'gender' => 'nullable|string',
            'dob' => 'nullable|date',
            'contact' => 'nullable|string',
            'emergency_contact' => 'nullable|string',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'address' => 'sometimes|string',
            'password' => 'sometimes|string|min:6',
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);
        return response()->json($user, 200);
    }

    // Delete
    public function destroy($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'User deleted successfully'], 200);
    }
}
