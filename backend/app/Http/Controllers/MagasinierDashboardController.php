<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Models\Categorie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MagasinierDashboardController extends Controller
{
    /**
     * Obtenir toutes les statistiques pour le dashboard du magasinier
     */
    public function getDashboardStats()
    {
        try {
            // Statistiques générales
            $stats = [
                'total_produits' => Produit::count(),
                'total_categories' => Categorie::count(),
                'valeur_stock' => Produit::sum(DB::raw('quantite * prix')),
                'produits_stock_faible' => Produit::where('quantite', '<=', 5)->count(),
            ];

            // Tous les produits avec leurs catégories
            $tous_produits = Produit::with('categorie')
                ->orderBy('quantite')
                ->get();

            // Top 5 des catégories par nombre de produits
            $top_categories = Categorie::withCount('produits')
                ->orderBy('produits_count', 'desc')
                ->take(5)
                ->get();

            // Distribution des produits par catégorie
            $distribution_categories = Categorie::withCount('produits')
                ->get()
                ->map(function ($categorie) {
                    return [
                        'categorie' => $categorie->nom,
                        'nombre_produits' => $categorie->produits_count
                    ];
                });

            // Produits les plus en stock
            $produits_plus_stock = Produit::with('categorie')
                ->orderBy('quantite', 'desc')
                ->take(5)
                ->get();

            return response()->json([
                'statistiques_generales' => $stats,
                'produits_stock_faible' => $tous_produits,
                'top_categories' => $top_categories,
                'distribution_categories' => $distribution_categories,
                'produits_plus_stock' => $produits_plus_stock
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur dashboard magasinier : ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir l'historique des mouvements de stock
     */
    public function getHistoriqueStock()
    {
        try {
            // TODO: Implémenter la logique pour suivre l'historique des mouvements de stock
            // Cette méthode sera implémentée une fois que nous aurons un système de suivi des mouvements de stock
            
            return response()->json([
                'message' => 'Fonctionnalité à implémenter'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur historique stock : ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération de l\'historique',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les alertes de stock
     */
    public function getAlertesStock()
    {
        try {
            $alertes = [
                'stock_faible' => Produit::where('quantite', '<=', 5)
                    ->with('categorie')
                    ->get(),
                'stock_critique' => Produit::where('quantite', '<=', 2)
                    ->with('categorie')
                    ->get(),
                'stock_epuise' => Produit::where('quantite', '=', 0)
                    ->with('categorie')
                    ->get()
            ];

            return response()->json($alertes);
        } catch (\Exception $e) {
            Log::error('Erreur alertes stock : ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération des alertes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 