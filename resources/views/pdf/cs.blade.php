<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { margin: 20mm 15mm; }
  body { font-family: 'DejaVu Sans', sans-serif; font-size: 10pt; color: #1a1a1a; line-height: 1.5; }
  .header { text-align: center; border-bottom: 3px solid #1a56db; padding-bottom: 12px; margin-bottom: 20px; }
  .header h1 { font-size: 18pt; color: #1a56db; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px; }
  .header .ref { font-size: 9pt; color: #6b7280; }
  .header .status { display: inline-block; background: #059669; color: #fff; font-size: 8pt; padding: 2px 10px; border-radius: 3px; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .section { margin-bottom: 18px; }
  .section-title { font-size: 11pt; font-weight: bold; color: #1a56db; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-grid { width: 100%; }
  .info-grid td { padding: 3px 8px; vertical-align: top; }
  .info-grid .label { font-weight: bold; color: #6b7280; width: 140px; font-size: 9pt; }
  .info-grid .value { font-size: 9pt; }
  table.data { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 6px; }
  table.data th { background: #f3f4f6; color: #374151; font-weight: bold; text-align: left; padding: 6px 8px; border: 1px solid #d1d5db; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.3px; }
  table.data td { padding: 5px 8px; border: 1px solid #d1d5db; }
  table.data tr:nth-child(even) { background: #f9fafb; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .text-success { color: #059669; font-weight: bold; }
  .badge { display: inline-block; background: #e5e7eb; font-size: 7pt; padding: 1px 6px; border-radius: 2px; text-transform: uppercase; }
  .badge-success { background: #d1fae5; color: #065f46; }
  .approved-stamp { text-align: center; margin-top: 24px; border: 2px solid #059669; padding: 10px 20px; display: inline-block; border-radius: 4px; }
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

<div class="section">
  <div class="section-title">Bid Comparison — Vendor Totals</div>
  <table class="data">
    <thead>
      <tr>
        <th style="width:8%">Rank</th>
        <th>Vendor</th>
        <th style="width:12%">ERP Code</th>
        <th style="width:18%" class="text-right">Total Price</th>
        <th style="width:12%" class="text-center">Status</th>
      </tr>
    </thead>
    <tbody>
      @forelse($items as $it)
        <tr>
          <td class="text-center">L{{ $it->rank }}</td>
          <td>{{ $it->vendor->name ?? '—' }}</td>
          <td>{{ $it->vendor->erp_code ?? '—' }}</td>
          <td class="text-right">{{ number_format($it->total_price, 2) }}</td>
          <td class="text-center">
            @if($it->selected)
              <span class="badge badge-success">Selected</span>
            @else
              <span class="badge">—</span>
            @endif
          </td>
        </tr>
      @empty
        <tr><td colspan="5" style="text-align:center;color:#6b7280;">No bids found.</td></tr>
      @endforelse
    </tbody>
  </table>
</div>

@if(count($cs->approvals) > 0)
  <div class="section">
    <div class="section-title">Approval History</div>
    <table class="data">
      <thead>
        <tr>
          <th>Step</th>
          <th>Decision</th>
          <th>Comment</th>
          <th>Acted At</th>
        </tr>
      </thead>
      <tbody>
        @foreach($cs->approvals as $a)
          <tr>
            <td><span class="badge">{{ ucfirst($a->step) }}</span></td>
            <td style="color:{{ $a->decision === 'approved' ? '#059669' : '#ef4444' }};font-weight:bold;">{{ ucfirst($a->decision) }}</td>
            <td>{{ $a->comment ?? '—' }}</td>
            <td>{{ $a->acted_at ? date('d M Y, h:i A', strtotime($a->acted_at)) : '—' }}</td>
          </tr>
        @endforeach
      </tbody>
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
