<?php

namespace App\Http\Controllers;

use App\Models\VendorCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorCategoryController extends Controller
{
    public function index()
    {
        $categories = VendorCategory::orderByDesc('created_at')->get();
        return Inertia::render('VendorCategories', ['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:vendor_categories,name',
        ]);

        VendorCategory::create($data);

        return back()->with('success', 'Category created successfully');
    }

    public function update(Request $request, VendorCategory $vendorCategory)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:vendor_categories,name,' . $vendorCategory->id,
        ]);

        $vendorCategory->update($data);

        return back()->with('success', 'Category updated successfully');
    }

    public function destroy(VendorCategory $vendorCategory)
    {
        $vendorCategory->delete();

        return back()->with('success', 'Category deleted successfully');
    }
}
