<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Remindear - Due Bills Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11px;
            color: #1a1a2e;
            background-color: #ffffff;
            line-height: 1.5;
        }

        /* ── Page Layout ── */
        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 14mm 16mm 14mm 16mm;
            margin: 0 auto;
            background: #ffffff;
        }

        /* ── Header ── */
        .header {
            display: table;
            width: 100%;
            border-bottom: 3px solid #1a1a2e;
            padding-bottom: 10px;
            margin-bottom: 18px;
        }

        .header-left {
            display: table-cell;
            vertical-align: middle;
            width: 70px;
        }

        .logo-img {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }

        .header-center {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
        }

        .system-name {
            font-size: 22px;
            font-weight: bold;
            color: #1a1a2e;
            letter-spacing: 3px;
            text-transform: uppercase;
        }

        .report-title {
            font-size: 13px;
            color: #4a4a6a;
            margin-top: 3px;
            letter-spacing: 1px;
        }

        .header-right {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            width: 130px;
        }

        .generated-label {
            font-size: 9px;
            color: #888888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .generated-date {
            font-size: 11px;
            font-weight: bold;
            color: #1a1a2e;
            margin-top: 2px;
        }

        /* ── Accent Bar ── */
        .accent-bar {
            height: 4px;
            background: linear-gradient(to right, #1a1a2e, #4a4a8a, #7a7abf);
            border-radius: 2px;
            margin-bottom: 18px;
        }

        /* ── Section Title ── */
        .section-title {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #ffffff;
            background-color: #1a1a2e;
            padding: 5px 10px;
            margin-bottom: 10px;
            border-radius: 3px;
        }

        /* ── User Info ── */
        .user-info-box {
            border: 1px solid #d0d0e0;
            border-radius: 4px;
            padding: 10px 14px;
            margin-bottom: 20px;
            background-color: #f7f7fc;
        }

        .user-info-table {
            width: 100%;
            border-collapse: collapse;
        }

        .user-info-table td {
            padding: 3px 8px;
            font-size: 11px;
        }

        .user-info-table .label {
            font-weight: bold;
            color: #4a4a6a;
            width: 100px;
        }

        .user-info-table .value {
            color: #1a1a2e;
        }

        /* ── Bills Table ── */
        .bills-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10.5px;
        }

        .bills-table thead tr {
            background-color: #1a1a2e;
            color: #ffffff;
        }

        .bills-table thead th {
            padding: 8px 7px;
            text-align: left;
            font-weight: bold;
            letter-spacing: 0.5px;
            border: 1px solid #1a1a2e;
            font-size: 10px;
            text-transform: uppercase;
        }

        .bills-table thead th.text-right {
            text-align: right;
        }

        .bills-table tbody tr {
            border-bottom: 1px solid #e0e0ee;
        }

        .bills-table tbody tr:nth-child(even) {
            background-color: #f4f4fb;
        }

        .bills-table tbody tr:nth-child(odd) {
            background-color: #ffffff;
        }

        .bills-table tbody td {
            padding: 7px 7px;
            border: 1px solid #dcdcec;
            color: #1a1a2e;
            vertical-align: middle;
        }

        .bills-table tbody td.text-right {
            text-align: right;
            font-weight: bold;
        }

        .bills-table tbody td.text-center {
            text-align: center;
        }

        /* Status badges */
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-paid {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .badge-unpaid {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .no-bills {
            text-align: center;
            padding: 20px;
            color: #888888;
            font-style: italic;
        }

        /* ── Summary Section ── */
        .summary-section {
            margin-bottom: 24px;
        }

        .summary-grid {
            display: table;
            width: 100%;
            border-collapse: separate;
            border-spacing: 6px;
        }

        .summary-card {
            display: table-cell;
            width: 25%;
            border: 1px solid #d0d0e0;
            border-radius: 4px;
            padding: 10px 12px;
            text-align: center;
            vertical-align: middle;
        }

        .summary-card.total {
            background-color: #eef0fb;
            border-color: #b0b8e8;
        }

        .summary-card.due {
            background-color: #fff3cd;
            border-color: #ffc107;
        }

        .summary-card.paid {
            background-color: #d4edda;
            border-color: #28a745;
        }

        .summary-card.unpaid {
            background-color: #f8d7da;
            border-color: #dc3545;
        }

        .summary-card .card-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #555577;
            font-weight: bold;
            margin-bottom: 4px;
        }

        .summary-card .card-value {
            font-size: 15px;
            font-weight: bold;
            color: #1a1a2e;
        }

        .summary-card .card-sub {
            font-size: 9px;
            color: #777799;
            margin-top: 2px;
        }

        /* ── Divider ── */
        .divider {
            border: none;
            border-top: 1px solid #d0d0e0;
            margin: 18px 0;
        }

        /* ── Footer ── */
        .footer {
            border-top: 2px solid #1a1a2e;
            padding-top: 12px;
            margin-top: 10px;
        }

        .footer-top {
            text-align: center;
            font-size: 10px;
            color: #4a4a6a;
            margin-bottom: 16px;
            letter-spacing: 0.5px;
        }

        .footer-top span {
            font-weight: bold;
            color: #1a1a2e;
        }

        .signature-row {
            display: table;
            width: 100%;
        }

        .signature-cell {
            display: table-cell;
            width: 50%;
            text-align: center;
            padding: 0 20px;
        }

        .signature-line {
            border-top: 1px solid #1a1a2e;
            margin: 0 20px 5px 20px;
        }

        .signature-label {
            font-size: 10px;
            color: #4a4a6a;
            font-weight: bold;
        }

        .signature-name {
            font-size: 9px;
            color: #888888;
            margin-top: 2px;
        }

        .footer-note {
            text-align: center;
            font-size: 8.5px;
            color: #aaaaaa;
            margin-top: 14px;
            letter-spacing: 0.5px;
        }

        /* ── Print Media ── */
        @page {
            size: A4;
            margin: 0;
        }

        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .page {
                width: 210mm;
                min-height: 297mm;
                padding: 14mm 16mm;
                margin: 0;
            }
        }
    </style>
</head>
<body>
<div class="page">

    {{-- ══════════════════════════════════════════ --}}
    {{-- HEADER                                     --}}
    {{-- ══════════════════════════════════════════ --}}
    <div class="header">
        <div class="header-left">
            <img src="{{ public_path('assets/REMINDear-Logo.png') }}" class="logo-img" alt="Remindear Logo">
        </div>

        <div class="header-center">
            <div class="system-name">Remindear</div>
            <div class="report-title">Due Bills Summary Report</div>
        </div>

        <div class="header-right">
            <div class="generated-label">Generated On</div>
            <div class="generated-date">{{ date('Y-m-d') }}</div>
        </div>
    </div>

    <div class="accent-bar"></div>

    {{-- ══════════════════════════════════════════ --}}
    {{-- USER INFORMATION                           --}}
    {{-- ══════════════════════════════════════════ --}}
    <div class="section-title">User Information</div>
    <div class="user-info-box">
        <table class="user-info-table">
            <tr>
                <td class="label">Name</td>
                <td class="value">{{ $user->name }}</td>
                <td class="label">Email</td>
                <td class="value">{{ $user->email }}</td>
            </tr>
            <tr>
                <td class="label">Report Period</td>
                <td class="value" colspan="3">All Due Bills as of {{ date('F d, Y') }}</td>
            </tr>
        </table>
    </div>

    {{-- ══════════════════════════════════════════ --}}
    {{-- BILLS TABLE                                --}}
    {{-- ══════════════════════════════════════════ --}}
    <div class="section-title">Bills &amp; Reminders</div>

    <table class="bills-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 22%;">Bill Details</th>
                <th style="width: 14%;">Category</th>
                <th style="width: 11%;">Due Date</th>
                <th class="text-right" style="width: 12%;">Amount</th>
                <th style="width: 10%; text-align:center;">Status</th>
                <th style="width: 16%;">Person In Charge</th>
            </tr>
        </thead>
        <tbody>
            @forelse($bills as $index => $bill)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $bill->details ?? '—' }}</td>
                <td>{{ optional($bill->category)->name ?? '—' }}</td>
                <td>{{ $bill->due_date }}</td>
                <td class="text-right">{{ number_format($bill->amount, 2) }}</td>
                <td class="text-center">
                    @if(strtolower($bill->status) === 'paid')
                        <span class="badge badge-paid">Paid</span>
                    @else
                        <span class="badge badge-unpaid">Unpaid</span>
                    @endif
                </td>
                <td>{{ optional($bill->personInCharge)->name ?? '—' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" class="no-bills">No bills found for this report.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    {{-- ══════════════════════════════════════════ --}}
    {{-- SUMMARY                                    --}}
    {{-- ══════════════════════════════════════════ --}}
    <div class="section-title">Summary</div>
    <div class="summary-section">
        <table class="summary-grid">
            <tr>
                <td class="summary-card total">
                    <div class="card-label">Total Bills</div>
                    <div class="card-value">{{ $bills->count() }}</div>
                    <div class="card-sub">records</div>
                </td>
                <td class="summary-card due">
                    <div class="card-label">Total Amount Due</div>
                    <div class="card-value">{{ number_format($bills->sum('amount'), 2) }}</div>
                    <div class="card-sub">all bills</div>
                </td>
                <td class="summary-card paid">
                    <div class="card-label">Total Paid</div>
                    <div class="card-value">
                        {{ number_format($bills->where('status', 'paid')->sum('amount'), 2) }}
                    </div>
                    <div class="card-sub">{{ $bills->where('status', 'paid')->count() }} bill(s)</div>
                </td>
                <td class="summary-card unpaid">
                    <div class="card-label">Total Unpaid</div>
                    <div class="card-value">
                        {{ number_format($bills->whereNotIn('status', ['paid'])->sum('amount'), 2) }}
                    </div>
                    <div class="card-sub">{{ $bills->whereNotIn('status', ['paid'])->count() }} bill(s)</div>
                </td>
            </tr>
        </table>
    </div>

    <hr class="divider">

    {{-- ══════════════════════════════════════════ --}}
    {{-- FOOTER                                     --}}
    {{-- ══════════════════════════════════════════ --}}
    <div class="footer">
        <div class="footer-top">
            Generated by <span>Remindear System</span> &nbsp;|&nbsp; {{ date('Y-m-d H:i:s') }}
        </div>

        <div class="signature-row">
            <div class="signature-cell">
                <div style="height: 30px;"></div>
                <div class="signature-line"></div>
                <div class="signature-label">Prepared by</div>
                <div class="signature-name">{{ $user->name }}</div>
            </div>
            <div class="signature-cell">
                <div style="height: 30px;"></div>
                <div class="signature-line"></div>
                <div class="signature-label">Approved by</div>
                <div class="signature-name">__________________________</div>
            </div>
        </div>

        <div class="footer-note">
            This is a system-generated report from Remindear. Please verify all information before use.
        </div>
    </div>

</div>
</body>
</html>
