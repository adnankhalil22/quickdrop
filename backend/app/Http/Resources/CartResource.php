<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $subtotal = $this->items->sum(fn ($item) => $item->unit_price * $item->quantity);
        $deliveryFee = (float) $this->restaurant->delivery_fee;

        return [
            'id' => $this->id,
            'restaurant' => [
                'id' => $this->restaurant->id,
                'name' => $this->restaurant->name,
                'delivery_fee' => $this->restaurant->delivery_fee,
                'minimum_order' => $this->restaurant->minimum_order,
                'is_active' => $this->restaurant->is_active,
            ],
            'items' => CartItemResource::collection($this->items),
            'subtotal' => round($subtotal, 2),
            'delivery_fee' => round($deliveryFee, 2),
            'total' => round($subtotal + $deliveryFee, 2),
        ];
    }
}
