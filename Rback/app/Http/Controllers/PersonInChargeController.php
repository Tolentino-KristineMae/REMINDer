<?php

namespace App\Http\Controllers;

use App\Models\PersonInCharge;
use App\Http\Resources\PersonInChargeResource;
use Illuminate\Http\Request;

class PersonInChargeController extends Controller
{
    public function index()
    {
        return response()->json([
            'people' => PersonInChargeResource::collection(PersonInCharge::all())
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:person_in_charges',
            'phone' => 'nullable|string|max:255',
            'avatar' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $person = PersonInCharge::create($request->all());

        return new PersonInChargeResource($person);
    }

    public function show(PersonInCharge $person)
    {
        return new PersonInChargeResource($person);
    }

    public function update(Request $request, PersonInCharge $person)
    {
        $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:person_in_charges,email,' . $person->id,
            'phone' => 'nullable|string|max:255',
            'avatar' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $person->update($request->all());

        return new PersonInChargeResource($person);
    }

    public function destroy(PersonInCharge $person)
    {
        // Check if person has bills
        if ($person->bills()->exists()) {
            return response()->json(['message' => 'Cannot delete person with associated bills'], 422);
        }

        $person->delete();

        return response()->json(['message' => 'Person deleted successfully']);
    }
}
