<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    /**
     * The forward-moving status transitions a restaurant manager may
     * perform. Cancellation is handled separately: customers may only
     * cancel while pending (see OrderController@cancel), and administrators
     * may override-cancel from any non-terminal status (see
     * canAdminTransitionTo()).
     *
     * @var array<string, list<string>>
     */
    public const TRANSITIONS = [
        'pending' => ['accepted', 'rejected'],
        'accepted' => ['preparing'],
        'preparing' => ['out_for_delivery'],
        'out_for_delivery' => ['delivered'],
    ];

    /**
     * Statuses from which no further transition is possible.
     *
     * @var list<string>
     */
    public const TERMINAL_STATUSES = ['delivered', 'cancelled', 'rejected'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'restaurant_id',
        'address_id',
        'status',
        'payment_method',
        'subtotal',
        'delivery_fee',
        'total',
        'customer_notes',
        'ordered_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'total' => 'decimal:2',
            'ordered_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function canTransitionTo(string $status): bool
    {
        return in_array($status, self::TRANSITIONS[$this->status] ?? [], true);
    }

    /**
     * Administrators may follow the normal forward workflow, or override
     * by cancelling the order from any status that hasn't already reached
     * a terminal state.
     */
    public function canAdminTransitionTo(string $status): bool
    {
        if ($status === 'cancelled') {
            return ! in_array($this->status, self::TERMINAL_STATUSES, true);
        }

        return $this->canTransitionTo($status);
    }
}
