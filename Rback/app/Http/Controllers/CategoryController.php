<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json([
            'categories' => Category::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'color' => 'nullable|string|max:7',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'color' => $request->color ?? '#22c55e',
        ]);

        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        // Check if there are any bills associated with this category
        if ($category->bills()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete category with associated bills.'
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.'
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'color' => 'nullable|string|max:7',
        ]);

        $category->update([
            'name' => $request->name,
            'color' => $request->color ?? $category->color,
        ]);

        return response()->json($category);
    }
}
