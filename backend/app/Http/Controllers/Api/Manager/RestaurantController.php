<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manager\UpdateRestaurantRequest;
use App\Http\Resources\RestaurantResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'restaurant' => new RestaurantResource($request->user()->restaurant),
        ]);
    }

    public function update(UpdateRestaurantRequest $request): JsonResponse
    {
        $restaurant = $request->user()->restaurant;

        $restaurant->update($request->validated());

        return response()->json([
            'message' => 'Restaurant updated successfully.',
            'restaurant' => new RestaurantResource($restaurant->fresh()),
        ]);
    }
}
