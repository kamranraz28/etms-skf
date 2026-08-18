<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { margin: 10mm 13mm; }
  body { font-family: 'DejaVu Sans', sans-serif; font-size: 10pt; color: #1a1a1a; line-height: 1.4; }
  .header { text-align: center; border-bottom: 3px solid #1a56db; padding-bottom: 8px; margin-bottom: 12px; }
  .header h1 { font-size: 16pt; color: #1a56db; margin: 0 0 2px; text-transform: uppercase; letter-spacing: 1px; }
  .header .ref { font-size: 8.5pt; color: #6b7280; }
  .header .status { display: inline-block; background: #059669; color: #fff; font-size: 8pt; padding: 2px 10px; border-radius: 3px; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
  .section { margin-bottom: 10px; }
  .section-title { font-size: 10pt; font-weight: bold; color: #1a56db; border-bottom: 1px solid #d1d5db; padding-bottom: 3px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-grid { width: 100%; }
  .info-grid td { padding: 2px 8px; vertical-align: top; }
  .info-grid .label { font-weight: bold; color: #6b7280; width: 140px; font-size: 8.5pt; }
  .info-grid .value { font-size: 8.5pt; }
  table.data { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-top: 4px; }
  table.data th { background: #f3f4f6; color: #374151; font-weight: bold; text-align: left; padding: 4px 8px; border: 1px solid #d1d5db; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.3px; }
  table.data td { padding: 4px 8px; border: 1px solid #d1d5db; }
  table.data tr:nth-child(even) { background: #f9fafb; }
  table.sign { width: 100%; border-collapse: collapse; margin-top: 8px; table-layout: fixed; }
  table.sign td { border: 1px solid #d1d5db; padding: 8px 10px; vertical-align: top; }
  .sign-decision { font-weight: bold; font-size: 8pt; margin-top: 2px; }
  .sign-step { font-size: 7pt; color: #1a56db; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold; }
  .sign-meta { font-size: 7.5pt; color: #6b7280; margin-top: 4px; line-height: 1.35; }
  .sign-name { font-size: 8.5pt; font-weight: bold; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; }
  .sign-dot { font-size: 7.5pt; color: #6b7280; }
  .sign-comment { font-style: italic; }
  .sign-line { border-top: 1px solid #6b7280; margin-top: 10px; padding-top: 3px; font-size: 7pt; color: #9ca3af; text-align: center; }
  .sign-empty { text-align: center; color: #9ca3af; font-size: 8pt; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .text-success { color: #059669; font-weight: bold; }
  .badge { display: inline-block; background: #e5e7eb; font-size: 7pt; padding: 1px 6px; border-radius: 2px; text-transform: uppercase; }
  .badge-success { background: #d1fae5; color: #065f46; }
  .approved-stamp { text-align: center; margin-top: 10px; border: 2px solid #059669; padding: 6px 18px; display: inline-block; border-radius: 4px; }
  .approved-stamp h2 { color: #059669; margin: 0; font-size: 14pt; text-transform: uppercase; letter-spacing: 2px; }
  .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 7pt; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 6px; }
  .page-break { page-break-before: always; }
</style>
</head>
<body>

<div class="header">
  <h1>Comparative Statement</h1>
  <div class="ref">CS-{{ $cs->id }} &middot; Generated {{ now()->format('d M Y, h:i A') }}</div>
  <div class="status">Approved</div>
</div>

<div class="section">
  <div class="section-title">Reference Information</div>
  <table class="info-grid">
    <tr><td class="label">CS ID</td><td class="value">CS-{{ $cs->id }}</td></tr>
    <tr><td class="label">Tender</td><td class="value">{{ $cs->tender->tender_number ?? '—' }} &mdash; {{ $cs->tender->title ?? '—' }}</td></tr>
    <tr><td class="label">PR No.</td><td class="value">{{ $cs->tender->pr->pr_number ?? '—' }}</td></tr>
    <tr><td class="label">PR Title</td><td class="value">{{ $cs->tender->pr->title ?? '—' }}</td></tr>
    <tr><td class="label">Department</td><td class="value">{{ $cs->tender->pr->department ?? '—' }}</td></tr>
    <tr><td class="label">Tender Deadline</td><td class="value">{{ $cs->tender->deadline ? date('d M Y', strtotime($cs->tender->deadline)) : '—' }}</td></tr>
    <tr><td class="label">Submitted At</td><td class="value">{{ $cs->submitted_at ? date('d M Y, h:i A', strtotime($cs->submitted_at)) : '—' }}</td></tr>
    <tr><td class="label">Approved At</td><td class="value">{{ $cs->approved_at ? date('d M Y, h:i A', strtotime($cs->approved_at)) : '—' }}</td></tr>
  </table>
</div>

<div class="section">
  <div class="section-title">Award Summary — Selected Vendors</div>
  @if(count($prItems) > 0)
    <table class="data">
      <thead>
        <tr>
          <th style="width:6%">#</th>
          <th>Item</th>
          <th style="width:10%">Qty</th>
          <th style="width:10%">Unit</th>
          <th>Awarded Vendor</th>
          <th style="width:12%" class="text-right">Unit Price</th>
          <th style="width:12%" class="text-right">Line Total</th>
        </tr>
      </thead>
      <tbody>
        @php $grandTotal = 0; @endphp
        @foreach($prItems as $idx => $pr)
          @php
            $sel = $selections->firstWhere('item_index', $idx);
          @endphp
          <tr>
            <td class="text-center">{{ $idx + 1 }}</td>
            <td>{{ $pr['name'] ?? '—' }}</td>
            <td>{{ $pr['qty'] ?? '—' }}</td>
            <td>{{ $pr['unit'] ?? '—' }}</td>
            <td>
              @if($sel)
                <span class="text-success">{{ $sel->vendor->name ?? '—' }}</span>
                <div style="font-size:7pt;color:#6b7280;">{{ $sel->vendor->erp_code ?? '' }}</div>
              @else
                <span style="color:#ef4444;">Not awarded</span>
              @endif
            </td>
            <td class="text-right">{{ $sel ? number_format($sel->unit_price, 2) : '—' }}</td>
            <td class="text-right">{{ $sel ? number_format($sel->qty * $sel->unit_price, 2) : '—' }}</td>
          </tr>
          @php if($sel) $grandTotal += $sel->qty * $sel->unit_price; @endphp
        @endforeach
      </tbody>
      <tfoot>
        <tr style="font-weight:bold;background:#f3f4f6;">
          <td colspan="6" class="text-right">Grand Total</td>
          <td class="text-right">{{ number_format($grandTotal, 2) }}</td>
        </tr>
      </tfoot>
    </table>
  @else
    <p style="color:#6b7280;font-style:italic;">No PR items available.</p>
  @endif
</div>

@if(count($cs->approvals) > 0)
  <div class="section">
    <div class="section-title">Approval / Attestation</div>
    <table class="sign">
      <tr>
        @foreach($cs->approvals as $a)
          <td style="width:{{ 100 / count($cs->approvals) }}%">
            <div class="sign-name">{{ $a->actor->full_name ?? '—' }}</div>
            <div class="sign-step">{{ ucfirst($a->step) }}</div>
            <div class="sign-decision" style="color:{{ $a->decision === 'approved' ? '#059669' : '#ef4444' }};">{{ ucfirst($a->decision) }}</div>
            <div class="sign-meta">{{ $a->acted_at ? date('d M Y, h:i A', strtotime($a->acted_at)) : '—' }}</div>
            <div class="sign-meta">Device:{{ $a->device_name ? ' ' . $a->device_name : '' }}{{ $a->device_ip ? ' (' . $a->device_ip . ')' : '' }}{{ !$a->device_name && !$a->device_ip ? ' —' : '' }}</div>
            @if($a->comment)
              <div class="sign-meta sign-comment">"{{ $a->comment }}"</div>
            @endif
            <div class="sign-line">Signature</div>
          </td>
        @endforeach
      </tr>
    </table>
  </div>
@endif

<div class="approved-stamp">
  <h2>&#10003; Approved</h2>
  <div style="font-size:8pt;color:#6b7280;margin-top:4px;">
    Approved on {{ $cs->approved_at ? date('d F Y', strtotime($cs->approved_at)) : '—' }}
  </div>
</div>

<div class="footer">
  Comparative Statement CS-{{ $cs->id }} &middot; Generated by eTMS on {{ now()->format('d M Y, h:i A') }} &middot; This is a system-generated document.
</div>

</body>
</html>
