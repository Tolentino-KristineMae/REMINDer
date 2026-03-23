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
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:person_in_charges,email',
            'phone' => 'nullable|string|max:20',
        ]);

        $fullName = $request->first_name . ' ' . $request->last_name;
        $initials = strtoupper($request->first_name[0] . ($request->last_name[0] ?? ''));

        $person = PersonInCharge::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'name' => $fullName,
            'email' => $request->email ?? null,
            'phone' => $request->phone ?? null,
            'avatar' => "https://api.dicebear.com/7.x/initials/svg?seed=" . urlencode($initials),
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
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:person_in_charges,email,' . $person->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $fullName = $request->first_name . ' ' . $request->last_name;
        $initials = strtoupper($request->first_name[0] . ($request->last_name[0] ?? ''));

        $person->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'name' => $fullName,
            'email' => $request->email ?? null,
            'phone' => $request->phone ?? $person->phone,
            'avatar' => "https://api.dicebear.com/7.x/initials/svg?seed=" . urlencode($initials),
        ]);

        return response()->json($person);
    }
}
