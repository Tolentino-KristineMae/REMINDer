<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json([
            'categories' => CategoryResource::collection(Category::all())
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'color' => 'required|string|max:7',
        ]);

        $category = Category::create($request->all());

        return new CategoryResource($category);
    }

    public function show(Category $category)
    {
        return new CategoryResource($category);
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255|unique:categories,name,' . $category->id,
            'color' => 'sometimes|string|max:7',
        ]);

        $category->update($request->all());

        return new CategoryResource($category);
    }

    public function destroy(Category $category)
    {
        // Check if category has bills
        if ($category->bills()->exists()) {
            return response()->json(['message' => 'Cannot delete category with associated bills'], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
