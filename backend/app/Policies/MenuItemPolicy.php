<?php

namespace App\Policies;

use App\Models\MenuItem;
use App\Models\User;

class MenuItemPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, MenuItem $menuItem): bool
    {
        return $user->id === $menuItem->restaurant->manager_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, MenuItem $menuItem): bool
    {
        return $user->id === $menuItem->restaurant->manager_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, MenuItem $menuItem): bool
    {
        return $user->id === $menuItem->restaurant->manager_id;
    }
}
