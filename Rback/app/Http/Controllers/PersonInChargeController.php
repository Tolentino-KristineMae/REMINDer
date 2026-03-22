<?php

namespace App\Http\Controllers;

use App\Models\PersonInCharge;
use Illuminate\Http\Request;

class PersonInChargeController extends Controller
{
    public function index()
    {
        return response()->json([
            'people' => PersonInCharge::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:person_in_charges,email',
            'phone' => 'nullable|string|max:20',
        ]);

        $person = PersonInCharge::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'avatar' => "https://api.dicebear.com/7.x/avataaars/svg?seed=" . urlencode($request->name),
        ]);

        return response()->json($person);
    }

    public function destroy(PersonInCharge $person)
    {
        // Check if there are any bills associated with this person
        if ($person->bills()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete person with associated bills.'
            ], 422);
        }

        $person->delete();

        return response()->json([
            'message' => 'Person deleted successfully.'
        ]);
    }

    public function update(Request $request, PersonInCharge $person)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:person_in_charges,email,' . $person->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $person->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone ?? $person->phone,
        ]);

        return response()->json($person);
    }
}
