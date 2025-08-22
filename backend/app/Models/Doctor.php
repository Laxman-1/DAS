<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

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
        'documents' => 'array', // for multiple file uploads
        'approve_status' => 'boolean',
        'dob' => 'date',
    ];

    // Relation with Category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
