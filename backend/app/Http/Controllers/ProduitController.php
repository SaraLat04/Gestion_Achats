<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;

class ProduitController extends Controller
{
    // Lister tous les produits
    public function index()
    {
        return response()->json(Produit::all(), 200);
    }

    // Afficher un seul produit
    public function show($id)
    {
        $produit = Produit::find($id);

        if (!$produit) {
            return response()->json(['message' => 'Produit non trouvé'], 404);
        }

        return response()->json($produit);
    }

    // Créer un nouveau produit
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix' => 'required|numeric|min:0',
            'quantite_stock' => 'required|integer|min:0',
        ]);

        $produit = Produit::create($request->all());

        return response()->json([
            'message' => 'Produit créé avec succès',
            'produit' => $produit,
        ], 201);
    }

    // Mettre à jour un produit
    public function update(Request $request, $id)
    {
        $produit = Produit::find($id);

        if (!$produit) {
            return response()->json(['message' => 'Produit non trouvé'], 404);
        }

        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'prix' => 'sometimes|required|numeric|min:0',
            'quantite_stock' => 'sometimes|required|integer|min:0',
        ]);

        $produit->update($request->all());

        return response()->json([
            'message' => 'Produit mis à jour avec succès',
            'produit' => $produit,
        ]);
    }

    // Supprimer un produit
    public function destroy($id)
    {
        $produit = Produit::find($id);

        if (!$produit) {
            return response()->json(['message' => 'Produit non trouvé'], 404);
        }

        $produit->delete();

        return response()->json(['message' => 'Produit supprimé avec succès']);
    }
}
