<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\UtilisateurController;
use App\Enums\UserRole;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Route pour récupérer l'utilisateur connecté
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json([
        'id' => $request->user()->id,
        'nom' => $request->user()->nom,
        'prenom' => $request->user()->prenom,
        'email' => $request->user()->email,
        'role' => $request->user()->role,
    ]);
});

// Routes protégées
Route::middleware(['auth:sanctum'])->group(function () {

    // ✅ Routes accessibles à tout utilisateur connecté
    Route::get('/demandes', [DemandeController::class, 'index']);
    Route::post('/demande', [DemandeController::class, 'store']);
    Route::put('/demande/{id}', [DemandeController::class, 'update']);
    Route::delete('/demande/{id}', [DemandeController::class, 'destroy']);
    Route::get('/statistiques-demandes', [DemandeController::class, 'getStatistiques']);

    Route::get('/produits', [ProduitController::class, 'index']);
    Route::post('/produits', [ProduitController::class, 'store']);
    Route::get('/produits/{id}', [ProduitController::class, 'show']);
    Route::put('/produits/{id}', [ProduitController::class, 'update']);
    Route::delete('/produits/{id}', [ProduitController::class, 'destroy']);

    // ✅ Routes réservées au chef de labo ou à l'admin
    Route::middleware('role:doyen')->group(function () {
        Route::get('/validation-demandes', [DemandeController::class, 'getStatistiques']);
        // Ajoute ici les autres routes sensibles (validation, etc.)
    });



});
