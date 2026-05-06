<?php
namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\Pr;
use App\Models\Tender;
use App\Models\Bid;
use Inertia\Inertia;

class DashboardController extends Controller {
    public function index() {
        $stats = [
            'vendors' => Vendor::count(),
            'vendorsPending' => Vendor::where('status', 'pending')->count(),
            'prs' => Pr::count(),
            'tenders' => Tender::count(),
            'tendersOpen' => Tender::where('status', 'open')->count(),
            'bids' => Bid::count(),
        ];
        $recentTenders = Tender::orderByDesc('created_at')->limit(5)
            ->get(['id','tender_number','title','status','deadline']);
        $recentVendors = Vendor::orderByDesc('created_at')->limit(5)
            ->get(['id','name','email','status','erp_code']);
        return Inertia::render('Dashboard', compact('stats', 'recentTenders', 'recentVendors'));
    }
}
