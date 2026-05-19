<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\VendorCategoryController;
use App\Http\Controllers\PrController;
use App\Http\Controllers\TenderController;
use App\Http\Controllers\BidController;
use App\Http\Controllers\CsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VendorProfileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ClaimController;

Route::get('/', [HomeController::class, 'index'])->name('home');

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/auth', [AuthController::class, 'show'])->name('auth.show');
    Route::post('/auth/login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('/auth/register', [AuthController::class, 'register'])->name('auth.register');
});
Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout')->middleware('auth');

// App
Route::middleware('auth')->prefix('app')->name('app.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Staff
    Route::middleware('role:admin,procurement,approver')->group(function () {
        Route::get('/vendors', [VendorController::class, 'index'])->name('vendors.index');
        Route::post('/vendors', [VendorController::class, 'store'])->name('vendors.store')->middleware('role:admin');
        Route::put('/vendors/{vendor}', [VendorController::class, 'update'])->name('vendors.update')->middleware('role:admin');
        Route::delete('/vendors/{vendor}', [VendorController::class, 'destroy'])->name('vendors.destroy')->middleware('role:admin');

        Route::get('/vendor-categories', [VendorCategoryController::class, 'index'])->name('vendor-categories.index');
        Route::post('/vendor-categories', [VendorCategoryController::class, 'store'])->name('vendor-categories.store')->middleware('role:admin');
        Route::put('/vendor-categories/{vendorCategory}', [VendorCategoryController::class, 'update'])->name('vendor-categories.update')->middleware('role:admin');
        Route::delete('/vendor-categories/{vendorCategory}', [VendorCategoryController::class, 'destroy'])->name('vendor-categories.destroy')->middleware('role:admin');

        Route::get('/prs', [PrController::class, 'index'])->name('prs.index');
        Route::post('/prs/sync', [PrController::class, 'sync'])->name('prs.sync');
        Route::post('/prs', [PrController::class, 'store'])->name('prs.store');
        Route::delete('/prs/{pr}', [PrController::class, 'destroy'])->name('prs.destroy');

        Route::get('/tenders', [TenderController::class, 'index'])->name('tenders.index');
        Route::get('/tenders/new', [TenderController::class, 'create'])->name('tenders.create');
        Route::post('/tenders', [TenderController::class, 'store'])->name('tenders.store');
        Route::get('/tenders/{tender}', [TenderController::class, 'show'])->name('tenders.show');
        Route::post('/tenders/{tender}/close', [TenderController::class, 'close'])->name('tenders.close');
        Route::post('/tenders/{tender}/generate-cs', [TenderController::class, 'generateCs'])->name('tenders.generate-cs');
        Route::get('/bids/{bid}/document', [BidController::class, 'document'])->name('bids.document');

        Route::get('/cs', [CsController::class, 'index'])->name('cs.index');
        Route::get('/cs/{cs}', [CsController::class, 'show'])->name('cs.show');
        Route::post('/cs/{cs}/select', [CsController::class, 'select'])->name('cs.select');
        Route::post('/cs/{cs}/submit', [CsController::class, 'submit'])->name('cs.submit');
        Route::post('/cs/{cs}/decide', [CsController::class, 'decide'])->name('cs.decide');
        Route::post('/cs/{cs}/erp', [CsController::class, 'sendToErp'])->name('cs.erp');

        // Claims (staff) — index only, parameterized routes come later
        Route::get('/claims', [ClaimController::class, 'index'])->name('claims.index');
    });

    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users/{user}/roles/{role}', [UserController::class, 'toggleRole'])->name('users.roles.toggle');
        Route::get('/claims/history', [ClaimController::class, 'history'])->name('claims.history');
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
        Route::get('/my-claims', [ClaimController::class, 'myClaims'])->name('my-claims');
        Route::get('/my-claims/{claim}', [ClaimController::class, 'myClaimShow'])->name('my-claims.show');
        Route::get('/claims/new', [ClaimController::class, 'createClaim'])->name('claims.create');
        Route::post('/claims', [ClaimController::class, 'storeClaim'])->name('claims.store');
    });

    // Parameterised claim routes (must be after fixed paths like /claims/new, /claims/history)
    Route::middleware('role:admin,procurement,approver')->group(function () {
        Route::get('/claims/{claim}', [ClaimController::class, 'show'])->name('claims.show');
        Route::post('/claims/{claim}/decide', [ClaimController::class, 'decide'])->name('claims.decide');
        Route::get('/claims/{claim}/documents/{docId}', [ClaimController::class, 'document'])->name('claims.document');
    });
});
