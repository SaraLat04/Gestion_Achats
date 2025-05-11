<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategorieController extends Controller
{
    /**
     * Afficher la liste des catégories
     */
    public function index()
    {
        $categories = Categorie::withCount('produits')
            ->orderBy('nom')
            ->get();

        return response()->json($categories);
    }

    /**
     * Afficher une catégorie spécifique
     */
    public function show($id)
    {
        $categorie = Categorie::with('produits')
            ->findOrFail($id);

        return response()->json($categorie);
    }

    /**
     * Créer une nouvelle catégorie
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string',
            'description' => 'nullable|string',
            'code' => 'required|string|unique:categories'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $categorie = Categorie::create($request->all());

        return response()->json($categorie, 201);
    }

    /**
     * Mettre à jour une catégorie
     */
    public function update(Request $request, $id)
    {
        $categorie = Categorie::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nom' => 'required|string',
            'description' => 'nullable|string',
            'code' => 'required|string|unique:categories,code,' . $id
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $categorie->update($request->all());

        return response()->json($categorie);
    }

    /**
     * Supprimer une catégorie
     */
    public function destroy($id)
    {
        $categorie = Categorie::findOrFail($id);

        // Vérifier si la catégorie a des produits
        if ($categorie->produits()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer cette catégorie car elle contient des produits'
            ], 422);
        }

        $categorie->delete();

        return response()->json(null, 204);
    }

    /**
     * Obtenir les statistiques des catégories
     */
    public function getStatistiques()
    {
        $statistiques = Categorie::withCount('produits')
            ->orderBy('produits_count', 'desc')
            ->get();

        return response()->json($statistiques);
    }
} 