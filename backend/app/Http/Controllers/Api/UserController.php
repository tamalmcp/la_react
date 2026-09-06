<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        // Only allow admin to access user management
        $this->middleware('auth:sanctum');
        $this->middleware('admin')->except(['index', 'show']);
    }

    public function index(): JsonResponse
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json($users);
    }

    public function show($id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            // 'role' => 'sometimes|in:admin,user',
            'role' => 'sometimes|exists:roles,name', // Validate against the roles table
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            // 'role' => $validated['role'] ?? 'user'
        ]);

                // Assign the role if provided, otherwise assign the 'user' role
                if (isset($validated['role'])) {
                    $user->assignRole($validated['role']);
                } else {
                    $user->assignRole('user');
                }

        return response()->json([
            'user' => $user,
            'message' => 'User created successfully'
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:8',
            // 'role' => 'sometimes|in:admin,user',
                    'role' => 'sometimes|exists:roles,name', // match store()'s validation
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }
        
        // Pull role out so it's not passed to $user->update() as a plain column
        $role = $validated['role'] ?? null;
        unset($validated['role']);

        $user->update($validated);
        
        if ($role) {
            $user->syncRoles($role);
        }

        return response()->json([
            // 'user' => $user,
            'user' => $user->fresh()->load('roles'), // fresh() + load('roles') so response reflects the new role
            'message' => 'User updated successfully'
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Prevent admin from deleting themselves
        if (auth()->id() === $user->id) {
            return response()->json([
                'message' => 'You cannot delete your own account'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    public function updateRole(Request $request, $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            // 'role' => 'required|in:admin,user'
            'role' => 'required|exists:roles,name',  // match store()'s validation style
        ]);

        // $user->update(['role' => $validated['role']]);
        $user->syncRoles($validated['role']);

        return response()->json([
            // 'user' => $user,
            'user' => $user->fresh()->load('roles'),
            'message' => 'User role updated successfully'
        ]);
    }
}
