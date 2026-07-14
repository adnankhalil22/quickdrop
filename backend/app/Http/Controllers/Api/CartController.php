<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddCartItemRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Models\CartItem;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cart = $request->user()->carts()->with(['items.menuItem', 'restaurant'])->first();

        return response()->json([
            'cart' => $cart ? new CartResource($cart) : null,
        ]);
    }

    public function addItem(AddCartItemRequest $request): JsonResponse
    {
        $user = $request->user();
        $menuItem = MenuItem::findOrFail($request->validated('menu_item_id'));
        $restaurant = $menuItem->restaurant;

        if (! $menuItem->is_available) {
            abort(422, 'This item is currently unavailable.');
        }

        if (! $restaurant->is_active) {
            abort(422, 'This restaurant is currently not accepting orders.');
        }

        $conflictingCart = $user->carts()
            ->where('restaurant_id', '!=', $restaurant->id)
            ->whereHas('items')
            ->first();

        if ($conflictingCart) {
            abort(409, 'Your cart contains items from another restaurant. Clear your cart before adding items from a different restaurant.');
        }

        $cart = $user->carts()->firstOrCreate(['restaurant_id' => $restaurant->id]);

        $cartItem = $cart->items()->where('menu_item_id', $menuItem->id)->first();

        if ($cartItem) {
            $cartItem->update([
                'quantity' => $cartItem->quantity + $request->validated('quantity'),
                'unit_price' => $menuItem->price,
                'notes' => $request->validated('notes') ?? $cartItem->notes,
            ]);
        } else {
            $cart->items()->create([
                'menu_item_id' => $menuItem->id,
                'quantity' => $request->validated('quantity'),
                'unit_price' => $menuItem->price,
                'notes' => $request->validated('notes'),
            ]);
        }

        $cart->load(['items.menuItem', 'restaurant']);

        return response()->json([
            'message' => 'Item added to cart.',
            'cart' => new CartResource($cart),
        ], 201);
    }

    public function updateItem(UpdateCartItemRequest $request, CartItem $cartItem): JsonResponse
    {
        $this->authorize('update', $cartItem);

        $cartItem->update($request->validated());

        $cart = $cartItem->cart->load(['items.menuItem', 'restaurant']);

        return response()->json([
            'message' => 'Cart item updated.',
            'cart' => new CartResource($cart),
        ]);
    }

    public function removeItem(Request $request, CartItem $cartItem): JsonResponse
    {
        $this->authorize('delete', $cartItem);

        $cart = $cartItem->cart;
        $cartItem->delete();

        if ($cart->items()->doesntExist()) {
            $cart->delete();

            return response()->json([
                'message' => 'Item removed from cart.',
                'cart' => null,
            ]);
        }

        $cart->load(['items.menuItem', 'restaurant']);

        return response()->json([
            'message' => 'Item removed from cart.',
            'cart' => new CartResource($cart),
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $request->user()->carts()->delete();

        return response()->json([
            'message' => 'Cart cleared.',
        ]);
    }
}
