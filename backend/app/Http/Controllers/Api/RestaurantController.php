<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Restaurant\ListRestaurantsRequest;
use App\Http\Resources\MenuCategoryResource;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RestaurantController extends Controller
{
    public function index(ListRestaurantsRequest $request): AnonymousResourceCollection
    {
        $restaurants = Restaurant::query()
            ->active()
            ->search($request->validated('search'))
            ->orderBy('name')
            ->paginate($request->validated('per_page') ?? 12);

        return RestaurantResource::collection($restaurants);
    }

    public function show(Restaurant $restaurant): JsonResponse
    {
        abort_unless($restaurant->is_active, 404);

        return response()->json([
            'restaurant' => new RestaurantResource($restaurant),
        ]);
    }

    public function menu(Restaurant $restaurant): JsonResponse
    {
        abort_unless($restaurant->is_active, 404);

        $restaurant->load('menuCategories.menuItems');

        return response()->json([
            'restaurant' => new RestaurantResource($restaurant),
            'categories' => MenuCategoryResource::collection($restaurant->menuCategories),
        ]);
    }
}
