<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRestaurantRequest;
use App\Http\Requests\Admin\UpdateRestaurantRequest;
use App\Http\Requests\Restaurant\ListRestaurantsRequest;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RestaurantController extends Controller
{
    public function index(ListRestaurantsRequest $request): AnonymousResourceCollection
    {
        $restaurants = Restaurant::query()
            ->search($request->validated('search'))
            ->orderBy('name')
            ->paginate($request->validated('per_page') ?? 12);

        return RestaurantResource::collection($restaurants);
    }

    public function store(StoreRestaurantRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['is_active'] = (bool) ($data['is_active'] ?? true);

        $restaurant = Restaurant::create($data);

        return response()->json([
            'message' => 'Restaurant created successfully.',
            'restaurant' => new RestaurantResource($restaurant),
        ], 201);
    }

    public function show(Restaurant $restaurant): JsonResponse
    {
        return response()->json([
            'restaurant' => new RestaurantResource($restaurant),
        ]);
    }

    public function update(UpdateRestaurantRequest $request, Restaurant $restaurant): JsonResponse
    {
        $restaurant->update($request->validated());

        return response()->json([
            'message' => 'Restaurant updated successfully.',
            'restaurant' => new RestaurantResource($restaurant->fresh()),
        ]);
    }

    public function destroy(Restaurant $restaurant): JsonResponse
    {
        $restaurant->delete();

        return response()->json([
            'message' => 'Restaurant deleted successfully.',
        ]);
    }
}
