<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Remindear &mdash; Due Bills Report</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 0;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10pt;
            color: #1c1c2e;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* ─── Page wrapper ─────────────────────────────── */
        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 12mm 15mm 14mm 15mm;
            background: #ffffff;
        }

        /* ─── Top colour band ───────────────────────────── */
        .top-band {
            background-color: #1b4332;
            height: 6pt;
            width: 100%;
            margin-bottom: 0;
        }

        /* ─── Header ────────────────────────────────────── */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0;
            padding: 10pt 0 10pt 0;
            border-bottom: 1.5pt solid #1b4332;
        }

        .header-logo-cell {
            width: 64pt;
            vertical-align: middle;
        }

        .logo-box {
            width: 54pt;
            height: 54pt;
            border: 1.5pt dashed #b0b8c1;
            border-radius: 5pt;
            text-align: center;
            vertical-align: middle;
            font-size: 7pt;
            color: #b0b8c1;
            line-height: 54pt;
            letter-spacing: 0.5pt;
        }

        .header-title-cell {
            vertical-align: middle;
            text-align: center;
        }

        .system-name {
            font-size: 22pt;
            font-weight: bold;
            color: #1b4332;
            letter-spacing: 4pt;
            text-transform: uppercase;
            line-height: 1;
        }

        .report-subtitle {
            font-size: 9pt;
            color: #4a6741;
            letter-spacing: 1.5pt;
            text-transform: uppercase;
            margin-top: 3pt;
        }

        .header-date-cell {
            width: 90pt;
            vertical-align: middle;
            text-align: right;
        }

        .date-label {
            font-size: 7pt;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
        }

        .date-value {
            font-size: 9pt;
            font-weight: bold;
            color: #1c1c2e;
            margin-top: 2pt;
        }

        .report-id {
            font-size: 7pt;
            color: #aaa;
            margin-top: 3pt;
        }

        /* ─── Section heading ───────────────────────────── */
        .section-heading {
            background-color: #1b4332;
            color: #ffffff;
            font-size: 7.5pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.2pt;
            padding: 4pt 8pt;
            margin-top: 12pt;
            margin-bottom: 6pt;
        }

        /* ─── User info ─────────────────────────────────── */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #f6faf7;
            border: 0.75pt solid #c8dfc8;
            border-radius: 3pt;
        }

        .info-table td {
            padding: 5pt 8pt;
            font-size: 9pt;
        }

        .info-label {
            font-weight: bold;
            color: #2d6a4f;
            width: 90pt;
        }

        .info-value {
            color: #1c1c2e;
        }

        .info-divider {
            border-top: 0.5pt solid #d8ead8;
        }

        /* ─── Bills table ───────────────────────────────── */
        .bills-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
            margin-bottom: 14pt;
        }

        .bills-table thead tr {
            background-color: #2d6a4f;
            color: #ffffff;
        }

        .bills-table thead th {
            padding: 6pt 6pt;
            text-align: left;
            font-size: 7.5pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
            border: 0.75pt solid #1b4332;
        }

        .bills-table thead th.r {
            text-align: right;
        }

        .bills-table thead th.c {
            text-align: center;
        }

        .bills-table tbody tr:nth-child(odd) {
            background-color: #ffffff;
        }

        .bills-table tbody tr:nth-child(even) {
            background-color: #f0f7f2;
        }

        .bills-table tbody td {
            padding: 5.5pt 6pt;
            border: 0.75pt solid #d0ddd0;
            color: #1c1c2e;
            vertical-align: middle;
        }

        .bills-table tbody td.r {
            text-align: right;
            font-weight: bold;
        }

        .bills-table tbody td.c {
            text-align: center;
        }

        .bills-table tfoot tr {
            background-color: #eaf3eb;
        }

        .bills-table tfoot td {
            padding: 5pt 6pt;
            border: 0.75pt solid #b8d4b8;
            font-size: 8pt;
            font-weight: bold;
            color: #1b4332;
        }

        /* Status pill */
        .pill {
            display: inline-block;
            padding: 1.5pt 7pt;
            border-radius: 8pt;
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.4pt;
        }

        .pill-paid {
            background-color: #d1fae5;
            color: #065f46;
            border: 0.5pt solid #6ee7b7;
        }

        .pill-unpaid {
            background-color: #fee2e2;
            color: #991b1b;
            border: 0.5pt solid #fca5a5;
        }

        .no-data {
            text-align: center;
            padding: 16pt;
            color: #999;
            font-style: italic;
            font-size: 9pt;
        }

        /* ─── Summary cards ─────────────────────────────── */
        .summary-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 5pt;
            margin-bottom: 14pt;
        }

        .summary-table td {
            width: 25%;
            border-radius: 4pt;
            padding: 8pt 10pt;
            text-align: center;
            vertical-align: middle;
        }

        .card-total   { background-color: #e8f4fd; border: 0.75pt solid #90caf9; }
        .card-due     { background-color: #fff8e1; border: 0.75pt solid #ffe082; }
        .card-paid    { background-color: #e8f5e9; border: 0.75pt solid #a5d6a7; }
        .card-unpaid  { background-color: #fce4ec; border: 0.75pt solid #f48fb1; }

        .card-label {
            font-size: 6.5pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8pt;
            color: #555;
            margin-bottom: 4pt;
        }

        .card-value {
            font-size: 14pt;
            font-weight: bold;
            color: #1c1c2e;
            line-height: 1;
        }

        .card-sub {
            font-size: 7pt;
            color: #888;
            margin-top: 2pt;
        }

        /* ─── Divider ───────────────────────────────────── */
        .hr {
            border: none;
            border-top: 0.75pt solid #ccc;
            margin: 12pt 0;
        }

        /* ─── Footer ────────────────────────────────────── */
        .footer-note {
            text-align: center;
            font-size: 8pt;
            color: #2d6a4f;
            font-weight: bold;
            margin-bottom: 12pt;
            letter-spacing: 0.5pt;
        }

        .sig-table {
            width: 100%;
            border-collapse: collapse;
        }

        .sig-table td {
            width: 50%;
            text-align: center;
            padding: 0 24pt;
        }

        .sig-space {
            height: 28pt;
        }

        .sig-line {
            border-top: 0.75pt solid #1c1c2e;
            margin: 0 16pt 4pt 16pt;
        }

        .sig-label {
            font-size: 8.5pt;
            font-weight: bold;
            color: #1c1c2e;
        }

        .sig-sub {
            font-size: 7pt;
            color: #888;
            margin-top: 2pt;
        }

        .bottom-band {
            background-color: #1b4332;
            height: 4pt;
            width: 100%;
            margin-top: 14pt;
        }

        .page-note {
            text-align: center;
            font-size: 7pt;
            color: #bbb;
            margin-top: 6pt;
            letter-spacing: 0.3pt;
        }

        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { padding: 12mm 15mm 14mm 15mm; }
        }
    </style>
</head>
<body>
<div class="page">

    {{-- ── Top colour band ── --}}
    <div class="top-band"></div>

    {{-- ════════════════════════════════════════════
         HEADER
    ════════════════════════════════════════════ --}}
    <table class="header-table">
        <tr>
            {{-- Logo --}}
            <td class="header-logo-cell">
                @if(file_exists(public_path('assets/REMINDear-Logo.png')))
                    <img src="{{ public_path('assets/REMINDear-Logo.png') }}"
                         style="width:54pt; height:54pt; object-fit:contain;" alt="Remindear Logo">
                @else
                    <div class="logo-box">LOGO</div>
                @endif
            </td>

            {{-- Title --}}
            <td class="header-title-cell">
                <div class="system-name">Remindear</div>
                <div class="report-subtitle">Due Bills Summary Report</div>
            </td>

            {{-- Date --}}
            <td class="header-date-cell">
                <div class="date-label">Generated On</div>
                <div class="date-value">{{ date('Y-m-d') }}</div>
                <div class="report-id">Ref&nbsp;#&nbsp;RPT-{{ date('YmdHis') }}</div>
            </td>
        </tr>
    </table>

    {{-- ════════════════════════════════════════════
         USER INFORMATION
    ════════════════════════════════════════════ --}}
    <div class="section-heading">User Information</div>
    <table class="info-table">
        <tr>
            <td class="info-label">Account Name</td>
            <td class="info-value">{{ $user->name }}</td>
            <td class="info-label">Email Address</td>
            <td class="info-value">{{ $user->email }}</td>
        </tr>
        <tr class="info-divider">
            <td class="info-label">Report Period</td>
            <td class="info-value" colspan="3">All Due Bills &mdash; as of {{ date('F d, Y') }}</td>
        </tr>
    </table>

    {{-- ════════════════════════════════════════════
         BILLS TABLE
    ════════════════════════════════════════════ --}}
    <div class="section-heading">Bills &amp; Reminders</div>
    <table class="bills-table">
        <thead>
            <tr>
                <th style="width:4%;">#</th>
                <th style="width:24%;">Bill Details</th>
                <th style="width:14%;">Category</th>
                <th style="width:11%;">Due Date</th>
                <th class="r" style="width:13%;">Amount (₱)</th>
                <th class="c" style="width:10%;">Status</th>
                <th style="width:16%;">Person In Charge</th>
            </tr>
        </thead>
        <tbody>
            @forelse($bills as $index => $bill)
            <tr>
                <td class="c">{{ $index + 1 }}</td>
                <td>{{ $bill->details ?? '—' }}</td>
                <td>{{ optional($bill->category)->name ?? '—' }}</td>
                <td>{{ $bill->due_date }}</td>
                <td class="r">{{ number_format($bill->amount, 2) }}</td>
                <td class="c">
                    @if(strtolower($bill->status) === 'paid')
                        <span class="pill pill-paid">Paid</span>
                    @else
                        <span class="pill pill-unpaid">Unpaid</span>
                    @endif
                </td>
                <td>{{ optional($bill->personInCharge)->name ?? '—' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" class="no-data">No bills found for this report period.</td>
            </tr>
            @endforelse
        </tbody>
        @if($bills->count() > 0)
        <tfoot>
            <tr>
                <td colspan="4" style="text-align:right; letter-spacing:0.3pt;">TOTAL</td>
                <td class="r">{{ number_format($bills->sum('amount'), 2) }}</td>
                <td colspan="2"></td>
            </tr>
        </tfoot>
        @endif
    </table>

    {{-- ════════════════════════════════════════════
         SUMMARY CARDS
    ════════════════════════════════════════════ --}}
    <div class="section-heading">Summary</div>
    <table class="summary-table">
        <tr>
            <td class="card-total">
                <div class="card-label">Total Bills</div>
                <div class="card-value">{{ $bills->count() }}</div>
                <div class="card-sub">records</div>
            </td>
            <td class="card-due">
                <div class="card-label">Total Amount</div>
                <div class="card-value">&#8369;&nbsp;{{ number_format($bills->sum('amount'), 2) }}</div>
                <div class="card-sub">all bills</div>
            </td>
            <td class="card-paid">
                <div class="card-label">Total Paid</div>
                <div class="card-value">&#8369;&nbsp;{{ number_format($bills->where('status', 'paid')->sum('amount'), 2) }}</div>
                <div class="card-sub">{{ $bills->where('status', 'paid')->count() }} bill(s)</div>
            </td>
            <td class="card-unpaid">
                <div class="card-label">Total Unpaid</div>
                <div class="card-value">&#8369;&nbsp;{{ number_format($bills->whereNotIn('status', ['paid'])->sum('amount'), 2) }}</div>
                <div class="card-sub">{{ $bills->whereNotIn('status', ['paid'])->count() }} bill(s)</div>
            </td>
        </tr>
    </table>

    <hr class="hr">

    {{-- ════════════════════════════════════════════
         FOOTER
    ════════════════════════════════════════════ --}}
    <div class="footer-note">Generated by Remindear System &nbsp;&bull;&nbsp; {{ date('F d, Y \a\t h:i A') }}</div>

    <table class="sig-table">
        <tr>
            <td>
                <div class="sig-space"></div>
                <div class="sig-line"></div>
                <div class="sig-label">Prepared by</div>
                <div class="sig-sub">{{ $user->name }}</div>
            </td>
            <td>
                <div class="sig-space"></div>
                <div class="sig-line"></div>
                <div class="sig-label">Approved by</div>
                <div class="sig-sub">Authorized Signatory</div>
            </td>
        </tr>
    </table>

    <div class="bottom-band"></div>
    <div class="page-note">This is a system-generated document from Remindear. Please verify all information before official use.</div>

</div>
</body>
</html>
