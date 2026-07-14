<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manager\StoreMenuCategoryRequest;
use App\Http\Requests\Manager\UpdateMenuCategoryRequest;
use App\Http\Resources\MenuCategoryResource;
use App\Models\MenuCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuCategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = $request->user()->restaurant->menuCategories()->orderBy('name')->get();

        return response()->json([
            'categories' => MenuCategoryResource::collection($categories),
        ]);
    }

    public function store(StoreMenuCategoryRequest $request): JsonResponse
    {
        $category = $request->user()->restaurant->menuCategories()->create($request->validated());

        return response()->json([
            'message' => 'Menu category created successfully.',
            'category' => new MenuCategoryResource($category),
        ], 201);
    }

    public function show(MenuCategory $menuCategory): JsonResponse
    {
        $this->authorize('view', $menuCategory);

        return response()->json([
            'category' => new MenuCategoryResource($menuCategory),
        ]);
    }

    public function update(UpdateMenuCategoryRequest $request, MenuCategory $menuCategory): JsonResponse
    {
        $this->authorize('update', $menuCategory);

        $menuCategory->update($request->validated());

        return response()->json([
            'message' => 'Menu category updated successfully.',
            'category' => new MenuCategoryResource($menuCategory->fresh()),
        ]);
    }

    public function destroy(MenuCategory $menuCategory): JsonResponse
    {
        $this->authorize('delete', $menuCategory);

        $menuCategory->delete();

        return response()->json([
            'message' => 'Menu category deleted successfully.',
        ]);
    }
}
