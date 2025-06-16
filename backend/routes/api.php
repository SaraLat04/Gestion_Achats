<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\ProduitController;
use App\Enums\UserRole;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\MouvementStockController;
use App\Http\Controllers\ProduitDemandeController;
use App\Http\Controllers\MagasinierDashboardController;
use App\Http\Controllers\ProfesseurDashboardController;
use App\Http\Controllers\ChefDepartementDashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/roles', [AuthController::class, 'getRoles']);
Route::get('/departements', [AuthController::class, 'getDepartements']);
Route::get('/utilisateurs/{id}', [AuthController::class, 'getUserById']);
Route::get('/produits/by-demande/{demandeId}', [ProduitDemandeController::class, 'getProduitsByDemande']);

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
Route::post('/demande/{id}/envoyer-au-secretaire-general', [DemandeController::class, 'sendToSecretaireGeneral']);
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
    Route::middleware('auth:sanctum')->get('/alerte-stock', [ProduitController::class, 'getProduitsStockFaible']);
    // Routes pour les produits
    Route::prefix('produits')->group(function () {
        Route::get('/', [ProduitController::class, 'index']);
        Route::get('/{id}', [ProduitController::class, 'show']);
        Route::post('/', [ProduitController::class, 'store']);
        Route::put('/{id}', [ProduitController::class, 'update']);
        Route::delete('/{id}', [ProduitController::class, 'destroy']);
        Route::get('/search', [ProduitController::class, 'search']);
        Route::get('/statistiques', [ProduitController::class, 'getStatistiques']);
        // routes/api.php


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

    // Routes pour le dashboard du magasinier
    Route::prefix('magasinier')->group(function () {
        Route::get('/dashboard', [MagasinierDashboardController::class, 'getDashboardStats']);
        Route::get('/historique-stock', [MagasinierDashboardController::class, 'getHistoriqueStock']);
        Route::get('/alertes-stock', [MagasinierDashboardController::class, 'getAlertesStock']);
    });

    // Routes pour le dashboard professeur
    Route::middleware(['auth:sanctum', 'role:professeur'])->group(function () {
        Route::get('/professeur/dashboard/stats', [ProfesseurDashboardController::class, 'getDashboardStats']);
    });

    // Routes pour le chef de département
    Route::middleware(['auth:sanctum', 'role:chef_depa'])->group(function () {
        Route::get('/chef-departement/dashboard/stats', [ChefDepartementDashboardController::class, 'getDashboardStats']);
    });

});

// Route::middleware('auth:sanctum')->get('/profile', function (Request $request) {
//     $user = $request->user();
//     // Ajoute la photo complète si besoin
//     $user->photo = $user->photo ? asset('storage/' . $user->photo) : null;
//     return response()->json($user);
// });

Route::middleware('auth:sanctum')->get('/profile', function (Request $request) {
    $user = $request->user();

    if ($user->photo && !preg_match('/^http/', $user->photo)) {
        // On ajoute l'URL complète avec asset()
        $user->photo = asset('storage/' . $user->photo);
    }

    return response()->json($user);
});

// Route pour modifier le profil utilisateur
Route::middleware(['auth:sanctum'])->group(function () {
    // ...
    Route::match(['put', 'post'], '/profile', [AuthController::class, 'updateProfile']);
});
