<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'menu_item_id' => $this->menu_item_id,
            'name' => $this->menuItem->name,
            'image' => $this->menuItem->image,
            'is_available' => $this->menuItem->is_available,
            'unit_price' => $this->unit_price,
            'quantity' => $this->quantity,
            'subtotal' => round($this->unit_price * $this->quantity, 2),
            'notes' => $this->notes,
        ];
    }
}
