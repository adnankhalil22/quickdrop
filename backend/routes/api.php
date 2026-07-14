<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\Manager\MenuCategoryController as ManagerMenuCategoryController;
use App\Http\Controllers\Api\Manager\MenuItemController as ManagerMenuItemController;
use App\Http\Controllers\Api\Manager\OrderController as ManagerOrderController;
use App\Http\Controllers\Api\Manager\RestaurantController as ManagerRestaurantController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RestaurantController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/restaurants/{restaurant}', [RestaurantController::class, 'show']);
Route::get('/restaurants/{restaurant}/menu', [RestaurantController::class, 'menu']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware(['auth:sanctum', 'role:customer'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::apiResource('addresses', AddressController::class);

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::put('/cart/items/{cartItem}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{cartItem}', [CartController::class, 'removeItem']);
    Route::delete('/cart', [CartController::class, 'clear']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
});

Route::middleware(['auth:sanctum', 'role:manager', 'manager.restaurant'])->prefix('manager')->group(function () {
    Route::get('/restaurant', [ManagerRestaurantController::class, 'show']);
    Route::put('/restaurant', [ManagerRestaurantController::class, 'update']);

    Route::apiResource('categories', ManagerMenuCategoryController::class)
        ->parameters(['categories' => 'menuCategory']);
    Route::apiResource('menu-items', ManagerMenuItemController::class)
        ->parameters(['menu-items' => 'menuItem']);

    Route::get('/orders', [ManagerOrderController::class, 'index']);
    Route::get('/orders/{order}', [ManagerOrderController::class, 'show']);
    Route::put('/orders/{order}/status', [ManagerOrderController::class, 'updateStatus']);
});
