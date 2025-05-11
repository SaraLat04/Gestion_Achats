<?php

namespace App\Http\Controllers;

use App\Models\MouvementStock;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MouvementStockController extends Controller
{
    public function index()
    {
        try {
            $mouvements = MouvementStock::with('produit')
                ->orderBy('date', 'desc')
                ->get();

            return response()->json($mouvements);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des mouvements: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération des mouvements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'produit_id' => 'required|exists:produits,id',
                'type' => 'required|in:entree,sortie',
                'quantite' => 'required|numeric|min:0.01',
                'date' => 'required|date',
                'motif' => 'required|string'
            ]);

            DB::beginTransaction();

            $produit = Produit::findOrFail($request->produit_id);

            // Vérifier si le stock est suffisant pour une sortie
            if ($request->type === 'sortie' && $produit->quantite < $request->quantite) {
                return response()->json([
                    'message' => 'Stock insuffisant pour effectuer cette sortie',
                    'stock_actuel' => $produit->quantite,
                    'quantite_demandee' => $request->quantite
                ], 422);
            }

            // Créer le mouvement
            $mouvement = MouvementStock::create($request->all());

            // Mettre à jour le stock du produit
            if ($request->type === 'entree') {
                $produit->quantite += $request->quantite;
            } else {
                $produit->quantite -= $request->quantite;
            }
            $produit->save();

            DB::commit();

            return response()->json([
                'message' => 'Mouvement créé avec succès',
                'mouvement' => $mouvement,
                'nouveau_stock' => $produit->quantite
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Erreur de validation: ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la création du mouvement: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Une erreur est survenue lors de la création du mouvement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStockProduit($produitId)
    {
        try {
            $produit = Produit::findOrFail($produitId);
            
            $mouvements = MouvementStock::where('produit_id', $produitId)
                ->orderBy('date', 'desc')
                ->get();

            return response()->json([
                'produit' => $produit,
                'mouvements' => $mouvements
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération du stock: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération du stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 