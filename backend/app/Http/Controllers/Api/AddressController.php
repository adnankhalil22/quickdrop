<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Address\StoreAddressRequest;
use App\Http\Requests\Address\UpdateAddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()
            ->addresses()
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'addresses' => AddressResource::collection($addresses),
        ]);
    }

    public function store(StoreAddressRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $isFirstAddress = $user->addresses()->doesntExist();
        $data['is_default'] = $isFirstAddress || (bool) ($data['is_default'] ?? false);

        if ($data['is_default']) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create($data);

        return response()->json([
            'message' => 'Address created successfully.',
            'address' => new AddressResource($address),
        ], 201);
    }

    public function show(Request $request, Address $address): JsonResponse
    {
        $this->authorize('view', $address);

        return response()->json([
            'address' => new AddressResource($address),
        ]);
    }

    public function update(UpdateAddressRequest $request, Address $address): JsonResponse
    {
        $this->authorize('update', $address);

        $data = $request->validated();
        $data['is_default'] = (bool) ($data['is_default'] ?? false);

        if ($data['is_default']) {
            $address->user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($data);

        return response()->json([
            'message' => 'Address updated successfully.',
            'address' => new AddressResource($address->fresh()),
        ]);
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        $this->authorize('delete', $address);

        $user = $address->user;
        $wasDefault = $address->is_default;

        $address->delete();

        if ($wasDefault) {
            $nextAddress = $user->addresses()->orderByDesc('created_at')->first();
            $nextAddress?->update(['is_default' => true]);
        }

        return response()->json([
            'message' => 'Address deleted successfully.',
        ]);
    }
}
