<?php

namespace App\Policies;

use App\Models\MenuCategory;
use App\Models\User;

class MenuCategoryPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, MenuCategory $menuCategory): bool
    {
        return $user->id === $menuCategory->restaurant->manager_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, MenuCategory $menuCategory): bool
    {
        return $user->id === $menuCategory->restaurant->manager_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, MenuCategory $menuCategory): bool
    {
        return $user->id === $menuCategory->restaurant->manager_id;
    }
}
