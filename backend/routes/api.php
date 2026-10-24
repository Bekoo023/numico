<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\AdministrationChatController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::patch('/user', [ProfileController::class, 'update']);
    Route::get('/receipts', [ReceiptController::class, 'index']);
    Route::get('/receipts/export', \App\Http\Controllers\ReceiptExportController::class)->middleware('throttle:10,1');
    Route::post('/receipts', [ReceiptController::class, 'store'])->middleware('throttle:30,1');
    Route::post('/receipts/{receipt}/extract', [ReceiptController::class, 'extract'])->whereNumber('receipt')->middleware('throttle:10,1');
    Route::patch('/receipts/{receipt}', [ReceiptController::class, 'update'])->whereNumber('receipt');
    Route::get('/receipts/{receipt}/file', [ReceiptController::class, 'file'])->whereNumber('receipt');
    Route::get('/administration/chat', [AdministrationChatController::class, 'index']);
    Route::post('/administration/chat', [AdministrationChatController::class, 'store'])->middleware('throttle:10,1');
});
