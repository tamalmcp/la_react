<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionController extends Controller
{
    public function __construct()
    {
        // $this->middleware('auth:sanctum');
        // Protect with a permission or role
        // $this->middleware('permission: manage roles|manage permissions');
    }

    // GET /api/roles
    public function indexRoles(): JsonResponse
    {
        $roles = Role::with('permissions')->get();
        return response()->json($roles);
    }

    // POST /api/roles
    public function storeRole(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
        ]);

        $role = Role::create(['name' => $validated['name']]);
        return response()->json($role, 201);
    }

    // PUT /api/roles/{role}
    public function updateRole(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name,'.$role->id,
        ]);

        $role->update(['name' => $validated['name']]);
        return response()->json($role);
    }

    // DELETE /api/roles/{role}
    public function destroyRole(Role $role): JsonResponse
    {
        // Optional: Prevent deleting critical roles like 'admin'
        if ($role->name === 'admin') {
            return response()->json(['message' => 'Cannot delete admin role'], 403);
        }

        $role->delete();
        return response()->json(['message' => 'Role deleted']);
    }

    // GET /api/permissions
    public function indexPermissions(): JsonResponse
    {
        $permissions = Permission::all();
        return response()->json($permissions);
    }

    // POST /api/permissions
    public function storePermission(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:permissions,name',
        ]);

        $permission = Permission::create(['name' =>$validated['name']]);
        return response()->json($permission, 201);
    }

    // DELETE /api/permissions/{permission}
    public function destroyPermission(Permission $permission): JsonResponse
    {
        $permission->delete();
        return response()->json(['message' => 'Permission deleted']);
    }

    // PUT /api/roles/{role}/permissions - Sync permissions to a role
    public function syncPermissions(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->syncPermissions($validated['permissions']);

        return response()->json([
            'message' => 'Permission synced successfully',
            'role' => $role->load('permissions')
        ]);
    }
}
