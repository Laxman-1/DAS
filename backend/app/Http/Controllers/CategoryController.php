<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // Get all categories
    public function index()
    {
        return response()->json(Category::all(), 200);
    }

    // Get one category
    public function show($id)
    {
        $category = Category::findOrFail($id);
        return response()->json($category, 200);
    }

    // Create category
    public function store(Request $request)
    {
        $data = $request->validate([
            'category' => 'required|string|unique:categories,category', // corrected column name
        ]);

        $category = Category::create($data);

        return response()->json($category, 201);
    }

    // Update category
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $data = $request->validate([
            'category' => 'required|string|unique:categories,category,' . $id, // corrected column name
        ]);

        $category->update($data);

        return response()->json($category, 200);
    }

    // Delete category
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully'], 200);
    }
}
