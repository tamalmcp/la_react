<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions (e.g., for the Product CRUD)
        $permissions = [
            'view products',
            'create products',
            'edit products',
            'delete products',
            'view users', // Add permissions for user management
            'create users',
            'edit users',
            'delete users',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all()); // Grant all permissions to admin

        $userRole = Role::create(['name' => 'user']);
        // Grant specific permissions to a regular user
        $userRole->givePermissionTo([
            'view products',
            'view users', // They can view users but not edit them
        ]);
    }
}
