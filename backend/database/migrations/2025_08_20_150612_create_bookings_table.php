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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            
            // Link to appointment
            $table->foreignId('appointment_id')
                  ->constrained('appointments')
                  ->onDelete('cascade');

            // Link to user
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            // Booking details
            $table->decimal('price', 8, 2); // Total price for booking
            $table->string('transaction_id')->nullable()->unique(); // Unique payment ID, nullable for cash payments
            $table->enum('payment_method', ['cash', 'khalti', 'esewa']); // Payment method
            $table->enum('payment_status', ['pending', 'completed', 'failed'])->default('pending'); // Payment status

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};