<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Models\Categorie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ProduitController extends Controller
{
    /**
     * Afficher la liste des produits
     */
    public function index()
    {
        $produits = Produit::with('categorie')
            ->orderBy('nom')
            ->get();

        return response()->json($produits);
    }

    /**
     * Afficher un produit spécifique
     */
    public function show($id)
    {
        $produit = Produit::with('categorie')
            ->findOrFail($id);

        return response()->json($produit);
    }

    /**
     * Créer un nouveau produit
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:produits',
            'nom' => 'required|string',
            'marque' => 'required|string',
            'categorie_id' => 'required|exists:categories,id',
            'quantite' => 'required|numeric|min:0',
            'unite' => 'required|string',
            'prix' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();

        // Gestion de l'image
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('produits', 'public');
        }

        $produit = Produit::create($data);

        return response()->json($produit, 201);
    }

    /**
     * Mettre à jour un produit
     */
    public function update(Request $request, $id)
    {
        $produit = Produit::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:produits,code,' . $id,
            'nom' => 'required|string',
            'marque' => 'required|string',
            'categorie_id' => 'required|exists:categories,id',
            'quantite' => 'required|numeric|min:0',
            'unite' => 'required|string',
            'prix' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();

        // Gestion de l'image
        if ($request->hasFile('image')) {
            // Supprimer l'ancienne image si elle existe
            if ($produit->image) {
                Storage::disk('public')->delete($produit->image);
            }
            $data['image'] = $request->file('image')->store('produits', 'public');
        }

        $produit->update($data);

        return response()->json($produit);
    }

    /**
     * Supprimer un produit
     */
    public function destroy($id)
    {
        $produit = Produit::findOrFail($id);

        // Supprimer l'image si elle existe
        if ($produit->image) {
            Storage::disk('public')->delete($produit->image);
        }

        $produit->delete();

        return response()->json(null, 204);
    }

    /**
     * Rechercher des produits
     */
    public function search(Request $request)
    {
        $query = Produit::query();

        if ($request->has('nom')) {
            $query->where('nom', 'like', '%' . $request->nom . '%');
        }

        if ($request->has('categorie_id')) {
            $query->where('categorie_id', $request->categorie_id);
        }

        if ($request->has('marque')) {
            $query->where('marque', 'like', '%' . $request->marque . '%');
        }

        $produits = $query->with('categorie')->get();

        return response()->json($produits);
    }
}
