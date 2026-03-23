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
        ]);

        $data = $request->all();
        $data['name'] = trim($request->first_name . ' ' . $request->last_name);

        $person = PersonInCharge::create($data);

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
        ]);

        $data = $request->all();
        if ($request->has('first_name') || $request->has('last_name')) {
            $firstName = $request->first_name ?? $person->first_name;
            $lastName = $request->last_name ?? $person->last_name;
            $data['name'] = trim($firstName . ' ' . $lastName);
        }

        $person->update($data);

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
