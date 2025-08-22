<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'user_id',
        'price',
        'transaction_id',
        'payment_method',
        'payment_status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'payment_method' => 'string',
        'payment_status' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}