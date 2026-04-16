<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    /**
     * Generate and download the Due Bills PDF report.
     */
    public function dueBillsPdf(Request $request)
    {
        $user = $request->user();

        $bills = Bill::with(['category', 'personInCharge'])
            ->where('user_id', $user->id)
            ->orderBy('due_date', 'asc')
            ->get();

        $pdf = Pdf::loadView('reports.due_bills_report', compact('user', 'bills'))
            ->setPaper('a4', 'portrait');

        $filename = 'remindear_due_bills_' . date('Y-m-d') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Preview the report in the browser (HTML).
     */
    public function dueBillsPreview(Request $request)
    {
        $user = $request->user();

        $bills = Bill::with(['category', 'personInCharge'])
            ->where('user_id', $user->id)
            ->orderBy('due_date', 'asc')
            ->get();

        return view('reports.due_bills_report', compact('user', 'bills'));
    }
}
