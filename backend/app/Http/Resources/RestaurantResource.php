<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantResource extends JsonResource
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
            'manager_id' => $this->manager_id,
            'name' => $this->name,
            'description' => $this->description,
            'phone' => $this->phone,
            'address' => $this->address,
            'image' => $this->image,
            'opening_time' => $this->opening_time,
            'closing_time' => $this->closing_time,
            'delivery_fee' => $this->delivery_fee,
            'minimum_order' => $this->minimum_order,
            'is_active' => $this->is_active,
        ];
    }
}
