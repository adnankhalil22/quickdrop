<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id;
    }

    /**
     * Determine whether the user can manage the model as the restaurant's manager.
     */
    public function manage(User $user, Order $order): bool
    {
        return $user->id === $order->restaurant->manager_id;
    }
}
