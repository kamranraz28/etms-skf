<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\VendorCategoryController;
use App\Http\Controllers\PrController;
use App\Http\Controllers\PoController;
use App\Http\Controllers\TenderController;
use App\Http\Controllers\BidController;
use App\Http\Controllers\CsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VendorProfileController;
use App\Http\Controllers\ClaimController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\WorkflowTypeController;
use App\Http\Controllers\NegotiationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RoleController;

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/', [AuthController::class, 'show'])->name('auth.show');
    Route::get('/auth', [AuthController::class, 'show']);
    Route::post('/auth/login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('/auth/register', [AuthController::class, 'register'])->name('auth.register');
});
Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout')->middleware('auth');
Route::get('/auth/unlock/{email}', [AuthController::class, 'unlock'])->name('auth.unlock')->middleware('signed');

// App
Route::middleware('auth')->prefix('app')->name('app.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Notifications
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');

    // Staff — every route below is gated by its own permission.
    // Manage the matrix at: Users & Roles > Roles & Permissions (admin).
    Route::group([], function () {
        Route::get('/vendors', [VendorController::class, 'index'])->name('vendors.index')->middleware('permission:vendors.view');
        Route::post('/vendors', [VendorController::class, 'store'])->name('vendors.store')->middleware('permission:vendors.manage');
        Route::put('/vendors/{vendor}', [VendorController::class, 'update'])->name('vendors.update')->middleware('permission:vendors.manage');
        Route::delete('/vendors/{vendor}', [VendorController::class, 'destroy'])->name('vendors.destroy')->middleware('permission:vendors.manage');

        Route::get('/vendor-categories', [VendorCategoryController::class, 'index'])->name('vendor-categories.index')->middleware('permission:vendor_categories.view');
        Route::post('/vendor-categories', [VendorCategoryController::class, 'store'])->name('vendor-categories.store')->middleware('permission:vendor_categories.manage');
        Route::put('/vendor-categories/{vendorCategory}', [VendorCategoryController::class, 'update'])->name('vendor-categories.update')->middleware('permission:vendor_categories.manage');
        Route::delete('/vendor-categories/{vendorCategory}', [VendorCategoryController::class, 'destroy'])->name('vendor-categories.destroy')->middleware('permission:vendor_categories.manage');

        Route::get('/prs', [PrController::class, 'index'])->name('prs.index')->middleware('permission:prs.view');
        Route::get('/prs/{pr}', [PrController::class, 'show'])->name('prs.show')->middleware('permission:prs.view');
        Route::post('/prs/sync', [PrController::class, 'sync'])->name('prs.sync')->middleware('permission:prs.manage');
        Route::post('/prs', [PrController::class, 'store'])->name('prs.store')->middleware('permission:prs.manage');
        Route::post('/prs/{pr}/assign-cs', [PrController::class, 'assignCs'])->name('prs.assign-cs')->middleware('permission:prs.manage');
        Route::delete('/prs/{pr}', [PrController::class, 'destroy'])->name('prs.destroy')->middleware('permission:prs.manage');

        Route::get('/pos', [PoController::class, 'index'])->name('pos.index')->middleware('permission:pos.view');
        Route::post('/pos/sync', [PoController::class, 'sync'])->name('pos.sync')->middleware('permission:pos.manage');
        Route::post('/pos', [PoController::class, 'store'])->name('pos.store')->middleware('permission:pos.manage');
        Route::delete('/pos/{po}', [PoController::class, 'destroy'])->name('pos.destroy')->middleware('permission:pos.manage');

        Route::get('/tenders', [TenderController::class, 'index'])->name('tenders.index')->middleware('permission:tenders.view');
        Route::get('/tenders/new', [TenderController::class, 'create'])->name('tenders.create')->middleware('permission:tenders.manage');
        Route::post('/tenders', [TenderController::class, 'store'])->name('tenders.store')->middleware('permission:tenders.manage');
        Route::get('/tenders/{tender}', [TenderController::class, 'show'])->name('tenders.show')->middleware('permission:tenders.view');
        Route::post('/tenders/{tender}/close', [TenderController::class, 'close'])->name('tenders.close')->middleware('permission:tenders.manage');
        Route::post('/tenders/{tender}/deadline', [TenderController::class, 'updateDeadline'])->name('tenders.deadline')->middleware('permission:tenders.manage');
        Route::post('/tenders/{tender}/invite', [TenderController::class, 'inviteVendors'])->name('tenders.invite')->middleware('permission:tenders.manage');
        Route::post('/tenders/{tender}/generate-cs', [TenderController::class, 'generateCs'])->name('tenders.generate-cs')->middleware('permission:tenders.manage');
        Route::get('/bids/{bid}/document', [BidController::class, 'document'])->name('bids.document')->middleware('permission:bids.documents');
        Route::post('/tenders/{tender}/bids/{bid}/offer', [NegotiationController::class, 'offer'])->name('tenders.offers.store')->middleware('permission:tenders.negotiate');

        Route::get('/cs', [CsController::class, 'index'])->name('cs.index')->middleware('permission:cs.view');
        Route::get('/cs/{cs}', [CsController::class, 'show'])->name('cs.show')->middleware('permission:cs.view');
        Route::post('/cs/{cs}/award', [CsController::class, 'award'])->name('cs.award')->middleware('permission:cs.manage');
        Route::post('/cs/{cs}/submit', [CsController::class, 'submit'])->name('cs.submit')->middleware('permission:cs.manage');
        Route::post('/cs/{cs}/decide', [CsController::class, 'decide'])->name('cs.decide')->middleware('permission:cs.decide');
        Route::post('/cs/{cs}/erp', [CsController::class, 'sendToErp'])->name('cs.erp')->middleware('permission:cs.erp');
        Route::get('/cs/{cs}/pdf', [CsController::class, 'downloadPdf'])->name('cs.pdf')->middleware('permission:cs.view');

        // Claims (staff) — index only, parameterized routes come later
        Route::get('/claims', [ClaimController::class, 'index'])->name('claims.index')->middleware('permission:claims.view');
    });

    // Administration
    Route::group([], function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index')->middleware('permission:users.manage');
        Route::post('/users', [UserController::class, 'store'])->name('users.store')->middleware('permission:users.manage');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update')->middleware('permission:users.manage');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('permission:users.manage');
        Route::post('/users/{user}/roles/{role}', [UserController::class, 'toggleRole'])->name('users.roles.toggle')->middleware('permission:users.manage');
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index')->middleware('permission:roles.manage');
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store')->middleware('permission:roles.manage');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update')->middleware('permission:roles.manage');
        Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy')->middleware('permission:roles.manage');
        Route::put('/roles/{role}/permissions', [RoleController::class, 'updatePermissions'])->name('roles.permissions.update')->middleware('permission:roles.manage');
        Route::get('/claims/history', [ClaimController::class, 'history'])->name('claims.history')->middleware('permission:claims.history');
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index')->middleware('permission:settings.manage');
        Route::put('/settings', [SettingsController::class, 'update'])->name('settings.update')->middleware('permission:settings.manage');
        Route::get('/workflow-types', [WorkflowTypeController::class, 'index'])->name('workflow-types.index')->middleware('permission:workflow.manage');
        Route::post('/workflow-types', [WorkflowTypeController::class, 'store'])->name('workflow-types.store')->middleware('permission:workflow.manage');
        Route::put('/workflow-types/{workflowType}', [WorkflowTypeController::class, 'update'])->name('workflow-types.update')->middleware('permission:workflow.manage');
        Route::delete('/workflow-types/{workflowType}', [WorkflowTypeController::class, 'destroy'])->name('workflow-types.destroy')->middleware('permission:workflow.manage');
    });

    // Vendor only — define fixed claim paths BEFORE parameterised staff routes
    Route::middleware('role:vendor')->group(function () {
        Route::get('/profile', [VendorProfileController::class, 'show'])->name('profile.show');
        Route::post('/profile', [VendorProfileController::class, 'save'])->name('profile.save');
        Route::post('/profile/password', [VendorProfileController::class, 'changePassword'])->name('profile.password');
        Route::get('/my-tenders', [BidController::class, 'myTenders'])->name('my-tenders');
        Route::get('/my-tenders/{tender}/bid', [BidController::class, 'create'])->name('bids.create');
        Route::post('/my-tenders/{tender}/bid', [BidController::class, 'store'])->name('bids.store');
        Route::get('/my-bids', [BidController::class, 'myBids'])->name('my-bids');
        Route::get('/my-bids/{bid}', [BidController::class, 'myBidShow'])->name('my-bids.show');
        Route::post('/offers/{negotiation}/accept', [NegotiationController::class, 'accept'])->name('offers.accept');
        Route::post('/offers/{negotiation}/reject', [NegotiationController::class, 'reject'])->name('offers.reject');
        Route::post('/offers/{negotiation}/counter', [NegotiationController::class, 'counter'])->name('offers.counter');
        Route::get('/my-claims', [ClaimController::class, 'myClaims'])->name('my-claims');
        Route::get('/my-claims/{claim}', [ClaimController::class, 'myClaimShow'])->name('my-claims.show');
        Route::get('/claims/new', [ClaimController::class, 'createClaim'])->name('claims.create');
        Route::post('/claims', [ClaimController::class, 'storeClaim'])->name('claims.store');
    });

    // Parameterised claim routes (must be after fixed paths like /claims/new, /claims/history)
    Route::group([], function () {
        Route::get('/claims/{claim}', [ClaimController::class, 'show'])->name('claims.show')->middleware('permission:claims.view');
        Route::post('/claims/{claim}/decide', [ClaimController::class, 'decide'])->name('claims.decide')->middleware('permission:claims.decide');
        Route::get('/claims/{claim}/documents/{docId}', [ClaimController::class, 'document'])->name('claims.document')->middleware('permission:claims.view');
    });
});
