<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\CartItem;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = $request->user();

        $cart = $user->carts()->with(['items.menuItem', 'restaurant'])->first();

        if (! $cart || $cart->items->isEmpty()) {
            abort(422, 'Your cart is empty.');
        }

        $restaurant = $cart->restaurant;

        if (! $restaurant->is_active) {
            abort(422, 'This restaurant is currently not accepting orders.');
        }

        $unavailableItem = $cart->items->first(fn (CartItem $item) => ! $item->menuItem->is_available);

        if ($unavailableItem) {
            abort(422, "\"{$unavailableItem->menuItem->name}\" is no longer available. Please update your cart.");
        }

        $subtotal = $cart->items->sum(fn (CartItem $item) => $item->unit_price * $item->quantity);

        if ($subtotal < $restaurant->minimum_order) {
            abort(422, "The minimum order amount for this restaurant is {$restaurant->minimum_order}.");
        }

        $order = DB::transaction(function () use ($user, $cart, $restaurant, $subtotal, $request) {
            $deliveryFee = $restaurant->delivery_fee;

            $order = Order::create([
                'user_id' => $user->id,
                'restaurant_id' => $restaurant->id,
                'address_id' => $request->validated('address_id'),
                'status' => 'pending',
                'payment_method' => 'cash',
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'total' => $subtotal + $deliveryFee,
                'customer_notes' => $request->validated('customer_notes'),
                'ordered_at' => now(),
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'menu_item_id' => $item->menu_item_id,
                    'item_name' => $item->menuItem->name,
                    'unit_price' => $item->unit_price,
                    'quantity' => $item->quantity,
                    'subtotal' => round($item->unit_price * $item->quantity, 2),
                    'notes' => $item->notes,
                ]);
            }

            $cart->delete();

            return $order;
        });

        $order->load(['items', 'restaurant', 'address', 'user']);

        return response()->json([
            'message' => 'Order placed successfully.',
            'order' => new OrderResource($order),
        ], 201);
    }
}
