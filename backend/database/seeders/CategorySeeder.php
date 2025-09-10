<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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
            Category::create($category);
        }
    }
}
