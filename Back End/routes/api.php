<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\KostController;
use App\Http\Controllers\Api\TestimoniController;
use App\Http\Controllers\Api\OtpController;
use App\Http\Controllers\Api\PembayaranController;
use App\Http\Controllers\Api\KamarController;
use App\Http\Controllers\Api\RoomTypeController;

// AUTHENTICATION
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->get('/profile', [AuthController::class, 'profile']);
    // Allow both PUT and POST methods to update profile (POST is used for multipart/form-data uploads)
    Route::middleware('auth:sanctum')->put('/profile', [AuthController::class, 'updateProfile']);
    Route::middleware('auth:sanctum')->post('/profile', [AuthController::class, 'updateProfile']);
    Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
});

// KOST Protected
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/kost', [KostController::class, 'store']);
});

// TESTIMONI
Route::get('/testimoni', [TestimoniController::class, 'index']);
Route::post('/testimoni', [TestimoniController::class, 'store']);

// OTP Routes
Route::prefix('otp')->group(function () {
    Route::post('/request', [OtpController::class, 'requestOtp']);
    Route::post('/verify', [OtpController::class, 'verifyOtp']);
});

// PAYMENTS (stub QRIS endpoints expected by FE)
Route::middleware('auth:sanctum')->prefix('payments')->group(function () {
    Route::post('/qris/create', [PembayaranController::class, 'createQris']);
    Route::get('/qris/status/{invoiceId}', [PembayaranController::class, 'checkQrisStatus']);
    Route::get('/history', [PembayaranController::class, 'history']);
});

// Invitation routes
Route::post('/invitations/validate', [InvitationController::class, 'validateInvitation']);
Route::post('/invitations/accept', [InvitationController::class, 'accept']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/invitations', [InvitationController::class, 'create']);
    Route::get('/invitations', [InvitationController::class, 'list']);
    Route::delete('/invitations/{id}', [InvitationController::class, 'delete']);
    // List tenants associated with the authenticated owner via accepted invitations
    Route::get('/owner/tenants', [InvitationController::class, 'tenants']);

    // Owner rooms management
    Route::get('/owner/rooms', [KamarController::class, 'ownerRooms']);
    Route::post('/owner/rooms', [KamarController::class, 'storeForOwner']);
    Route::put('/owner/rooms/{id}', [KamarController::class, 'updateForOwner']);
    Route::delete('/owner/rooms/{id}', [KamarController::class, 'destroyForOwner']);
    Route::put('/owner/rooms/{id}/assign-tenant', [KamarController::class, 'assignTenant']);

    // Owner room types management
    Route::get('/owner/room-types', [RoomTypeController::class, 'indexForOwner']);
    Route::post('/owner/room-types', [RoomTypeController::class, 'storeForOwner']);
    Route::put('/owner/room-types/{id}', [RoomTypeController::class, 'updateForOwner']);
    Route::delete('/owner/room-types/{id}', [RoomTypeController::class, 'destroyForOwner']);

    // Tenant: get my room & kost info
    Route::get('/tenant/my-room', [KamarController::class, 'tenantRoom']);
});

Route::get('/test-api', function () {
    return response()->json(['ok' => true]);
});
