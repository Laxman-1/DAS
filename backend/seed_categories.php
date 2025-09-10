<?php

// Simple script to seed categories
// Run this with: php seed_categories.php

require_once 'vendor/autoload.php';

use App\Models\Category;

$categories = [
    [
        'name' => 'Cardiology',
        'description' => 'Heart and cardiovascular system specialists'
    ],
    [
        'name' => 'Neurology',
        'description' => 'Brain and nervous system specialists'
    ],
    [
        'name' => 'Pediatrics',
        'description' => 'Children\'s health specialists'
    ],
    [
        'name' => 'Internal Medicine',
        'description' => 'Adult internal organ specialists'
    ],
    [
        'name' => 'Dermatology',
        'description' => 'Skin, hair, and nail specialists'
    ],
    [
        'name' => 'Orthopedics',
        'description' => 'Bone, joint, and muscle specialists'
    ],
    [
        'name' => 'Gynecology',
        'description' => 'Women\'s reproductive health specialists'
    ],
    [
        'name' => 'Psychiatry',
        'description' => 'Mental health specialists'
    ],
    [
        'name' => 'Ophthalmology',
        'description' => 'Eye and vision specialists'
    ],
    [
        'name' => 'ENT',
        'description' => 'Ear, nose, and throat specialists'
    ]
];

foreach ($categories as $category) {
    try {
        Category::create($category);
        echo "Created category: " . $category['name'] . "\n";
    } catch (Exception $e) {
        echo "Error creating category " . $category['name'] . ": " . $e->getMessage() . "\n";
    }
}

echo "Category seeding completed!\n";
