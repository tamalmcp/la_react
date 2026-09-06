<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

// Route::apiResource('products', ProductController::class);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // Auth Routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Route::apiResource('products', ProductController::class);
    // Product CRUD with granular permission checks
    // This applies the permission check to all methods in the controller
    Route::middleware('permission:view products|create products|edit products|delete products')->group(function () {
        Route::get('/products', [ProductController::class, 'index'])->middleware('permission:view products');
        Route::post('/products', [ProductController::class, 'store'])->middleware('permission:create products');
        Route::get('/products/{id}', [ProductController::class, 'show'])->middleware('permission:view products');
        Route::put('/products/{id}', [ProductController::class, 'update'])->middleware('permission:edit products');
        Route::delete('/products/{id}', [ProductController::class, 'destroy'])->middleware('permission:delete products');
    });

    // Route::apiResource('users', UserController::class);
    // Route::put('/users/{id}/role', [UserController::class, 'updateRole']);
    // User management routes (Admin Only)
    Route::middleware('permission:view users|create users|edit users|delete users')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->middleware('permission:view users');
        Route::post('/users', [UserController::class, 'store'])->middleware('permission:create users');
        Route::get('/users/{id}', [UserController::class, 'show'])->middleware('permission:view users');
        Route::put('/users/{id}', [UserController::class, 'update'])->middleware('permission:edit users');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('permission:delete users');
        Route::put('/users/{id}/role', [UserController::class, 'updateRole'])->middleware('permission:edit users');
    });
});

// Route::middleware('auth:sanctum')->group(function () {
//     Route::post('products', [ProductController::class, 'store']);
//     Route::put('products/{product}', [ProductController::class, 'update']);
//     Route::delete('products/{product}', [ProductController::class, 'destroy']);
// });
