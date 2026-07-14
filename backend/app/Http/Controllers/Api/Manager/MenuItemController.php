<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manager\StoreMenuItemRequest;
use App\Http\Requests\Manager\UpdateMenuItemRequest;
use App\Http\Resources\MenuItemResource;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $restaurantId = $request->user()->restaurant->id;

        $items = MenuItem::whereHas('category', fn ($q) => $q->where('restaurant_id', $restaurantId))
            ->orderBy('name')
            ->get();

        return response()->json([
            'menu_items' => MenuItemResource::collection($items),
        ]);
    }

    public function store(StoreMenuItemRequest $request): JsonResponse
    {
        $item = MenuItem::create($request->validated())->fresh();

        return response()->json([
            'message' => 'Menu item created successfully.',
            'menu_item' => new MenuItemResource($item),
        ], 201);
    }

    public function show(MenuItem $menuItem): JsonResponse
    {
        $this->authorize('view', $menuItem);

        return response()->json([
            'menu_item' => new MenuItemResource($menuItem),
        ]);
    }

    public function update(UpdateMenuItemRequest $request, MenuItem $menuItem): JsonResponse
    {
        $this->authorize('update', $menuItem);

        $menuItem->update($request->validated());

        return response()->json([
            'message' => 'Menu item updated successfully.',
            'menu_item' => new MenuItemResource($menuItem->fresh()),
        ]);
    }

    public function destroy(MenuItem $menuItem): JsonResponse
    {
        $this->authorize('delete', $menuItem);

        $menuItem->delete();

        return response()->json([
            'message' => 'Menu item deleted successfully.',
        ]);
    }
}
