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
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();

            // Doctor personal info
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password'); // if doctors log in directly
            $table->string('gender')->nullable();
            $table->date('dob')->nullable();
            $table->string('contact')->nullable();
            $table->string('address')->nullable();

            // Citizenship & Passport
            $table->string('citizenship_number')->nullable();
            $table->string('citizenship_file')->nullable(); // pdf or image
            $table->string('passport_file')->nullable();    // pdf or image

            // Professional info
            $table->string('qualification');
            $table->string('specialization');
            $table->string('license_number')->unique();
            $table->string('experience');
            $table->text('bio')->nullable();
            $table->string('image')->nullable();

            // Additional Documents (max 4)
            $table->json('documents')->nullable(); // array of pdf/image paths

            // Category (foreign key)
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');

            // Approval flag
            $table->boolean('approve_status')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
