<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Http\Requests\Order\ListOrdersRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function index(ListOrdersRequest $request): AnonymousResourceCollection
    {
        $orders = Order::query()
            ->with(['user', 'restaurant'])
            ->orderByDesc('ordered_at')
            ->paginate($request->validated('per_page') ?? 10);

        return OrderResource::collection($orders);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['items', 'restaurant', 'address', 'user']);

        return response()->json([
            'order' => new OrderResource($order),
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $newStatus = $request->validated('status');

        if (! $order->canAdminTransitionTo($newStatus)) {
            abort(422, "Cannot change order status from \"{$order->status}\" to \"{$newStatus}\".");
        }

        $order->update(['status' => $newStatus]);

        $order->load(['items', 'restaurant', 'address', 'user']);

        return response()->json([
            'message' => 'Order status updated successfully.',
            'order' => new OrderResource($order),
        ]);
    }
}
