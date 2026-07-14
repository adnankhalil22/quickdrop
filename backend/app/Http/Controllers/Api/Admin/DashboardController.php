<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'users' => [
                'total' => User::count(),
                'customers' => User::where('role', 'customer')->count(),
                'managers' => User::where('role', 'manager')->count(),
                'admins' => User::where('role', 'admin')->count(),
            ],
            'restaurants' => [
                'total' => Restaurant::count(),
                'active' => Restaurant::where('is_active', true)->count(),
                'inactive' => Restaurant::where('is_active', false)->count(),
            ],
            'orders' => [
                'total' => Order::count(),
                'pending' => Order::where('status', 'pending')->count(),
                'accepted' => Order::where('status', 'accepted')->count(),
                'preparing' => Order::where('status', 'preparing')->count(),
                'out_for_delivery' => Order::where('status', 'out_for_delivery')->count(),
                'delivered' => Order::where('status', 'delivered')->count(),
                'cancelled' => Order::where('status', 'cancelled')->count(),
                'rejected' => Order::where('status', 'rejected')->count(),
            ],
            'revenue' => round((float) Order::where('status', 'delivered')->sum('total'), 2),
        ]);
    }
}
