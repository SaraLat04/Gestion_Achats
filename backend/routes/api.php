<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\UtilisateurController;
use App\Enums\UserRole;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\MouvementStockController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/roles', [AuthController::class, 'getRoles']);

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
    Route::get('/allDemandes', [DemandeController::class, 'all']);
    Route::post('/demande', [DemandeController::class, 'store']);
    Route::put('/demande/{id}', [DemandeController::class, 'update']);
    Route::delete('/demande/{id}', [DemandeController::class, 'destroy']);
    Route::get('/statistiques-demandes', [DemandeController::class, 'getStatistiques']);
    Route::post('/demande/{id}/envoyer-au-doyen', [DemandeController::class, 'sendToDean']);

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

    Route::post('/demande/{id}/envoyer-au-responsable', [DemandeController::class, 'sendToResponsable']);
    Route::post('/demande/{id}/finaliser', [DemandeController::class, 'finaliserDemande']);
    Route::post('/demande/{id}/rejeter', [DemandeController::class, 'reject']);

    Route::middleware('auth:sanctum')->get('/notifications', [DemandeController::class, 'getNotifications']);

    // Routes pour les produits
    Route::prefix('produits')->group(function () {
        Route::get('/', [ProduitController::class, 'index']);
        Route::get('/{id}', [ProduitController::class, 'show']);
        Route::post('/', [ProduitController::class, 'store']);
        Route::put('/{id}', [ProduitController::class, 'update']);
        Route::delete('/{id}', [ProduitController::class, 'destroy']);
        Route::get('/search', [ProduitController::class, 'search']);
        Route::get('/statistiques', [ProduitController::class, 'getStatistiques']);
    });

    // Routes pour les catégories
    Route::prefix('categories')->group(function () {
        Route::get('/', [CategorieController::class, 'index']);
        Route::get('/{id}', [CategorieController::class, 'show']);
        Route::post('/', [CategorieController::class, 'store']);
        Route::put('/{id}', [CategorieController::class, 'update']);
        Route::delete('/{id}', [CategorieController::class, 'destroy']);
        Route::get('/statistiques', [CategorieController::class, 'getStatistiques']);
    });

    // Routes pour les fournisseurs
    Route::prefix('fournisseurs')->group(function () {
        Route::get('/', [FournisseurController::class, 'index']);
        Route::get('/{id}', [FournisseurController::class, 'show']);
        Route::post('/', [FournisseurController::class, 'store']);
        Route::put('/{id}', [FournisseurController::class, 'update']);
        Route::delete('/{id}', [FournisseurController::class, 'destroy']);
        Route::get('/search', [FournisseurController::class, 'search']);
        Route::get('/statistiques', [FournisseurController::class, 'getStatistiques']);
    });

    // Routes pour les mouvements de stock
    Route::get('/mouvements-stock', [MouvementStockController::class, 'index']);
    Route::post('/mouvements-stock', [MouvementStockController::class, 'store']);
    Route::get('/produits/{produit}/stock', [MouvementStockController::class, 'getStockProduit']);

});
