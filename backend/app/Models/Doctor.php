<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Doctor extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'gender',
        'dob',
        'contact',
        'address',
        'citizenship_number',
        'citizenship_file',
        'passport_file',
        'qualification',
        'specialization',
        'license_number',
        'experience',
        'bio',
        'image',
        'documents',
        'category_id',
        'approve_status',
    ];

    protected $casts = [
        'documents' => 'array', // For multiple file uploads
        'approve_status' => 'boolean',
        'dob' => 'date',
    ];

    // Hide sensitive fields
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Relation with Category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function appointments()
{
    return $this->hasMany(\App\Models\Appointment::class);
}

}