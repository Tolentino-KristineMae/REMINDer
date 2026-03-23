<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PushSubscriptionController extends Controller
{
    /**
     * Store a push subscription.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $this->validate($request, [
            'endpoint'    => 'required',
            'keys.auth'   => 'required',
            'keys.p256dh' => 'required'
        ]);

        $endpoint = $request->endpoint;
        $key = $request->keys['p256dh'];
        $token = $request->keys['auth'];
        $contentEncoding = $request->contentEncoding ?? 'aesgcm';

        /** @var \App\Models\User $user */
        $user = $request->user();
        $user->updatePushSubscription($endpoint, $key, $token, $contentEncoding);

        return response()->json([
            'success' => true
        ]);
    }

    /**
     * Delete a push subscription.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request)
    {
        $this->validate($request, [
            'endpoint' => 'required'
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();
        $user->deletePushSubscription($request->endpoint);

        return response()->json([
            'success' => true
        ], 204);
    }
}
