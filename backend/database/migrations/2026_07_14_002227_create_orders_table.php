<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('restaurant_id')->constrained('restaurants')->cascadeOnDelete();
            $table->foreignId('address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->enum('status', [
                'pending',
                'accepted',
                'preparing',
                'out_for_delivery',
                'delivered',
                'cancelled',
                'rejected',
            ])->default('pending');
            $table->enum('payment_method', ['cash'])->default('cash');
            $table->decimal('subtotal', 8, 2);
            $table->decimal('delivery_fee', 8, 2);
            $table->decimal('total', 8, 2);
            $table->text('customer_notes')->nullable();
            $table->timestamp('ordered_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
