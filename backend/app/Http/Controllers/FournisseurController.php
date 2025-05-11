<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FournisseurController extends Controller
{
    /**
     * Afficher la liste des fournisseurs
     */
    public function index()
    {
        $fournisseurs = Fournisseur::orderBy('nom')
            ->get();

        return response()->json($fournisseurs);
    }

    /**
     * Afficher un fournisseur spécifique
     */
    public function show($id)
    {
        $fournisseur = Fournisseur::with('produits')
            ->findOrFail($id);

        return response()->json($fournisseur);
    }

    /**
     * Créer un nouveau fournisseur
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string',
            'email' => 'required|email|unique:fournisseurs',
            'telephone' => 'required|string',
            'adresse' => 'required|string',
            'ville' => 'required|string',
            'pays' => 'required|string',
            'code_postal' => 'required|string',
            'site_web' => 'nullable|url',
            'notes' => 'nullable|string',
            'statut' => 'required|in:actif,inactif'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $fournisseur = Fournisseur::create($request->all());

        return response()->json($fournisseur, 201);
    }

    /**
     * Mettre à jour un fournisseur
     */
    public function update(Request $request, $id)
    {
        $fournisseur = Fournisseur::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nom' => 'required|string',
            'email' => 'required|email|unique:fournisseurs,email,' . $id,
            'telephone' => 'required|string',
            'adresse' => 'required|string',
            'ville' => 'required|string',
            'pays' => 'required|string',
            'code_postal' => 'required|string',
            'site_web' => 'nullable|url',
            'notes' => 'nullable|string',
            'statut' => 'required|in:actif,inactif'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $fournisseur->update($request->all());

        return response()->json($fournisseur);
    }

    /**
     * Supprimer un fournisseur
     */
    public function destroy($id)
    {
        $fournisseur = Fournisseur::findOrFail($id);

        // Vérifier si le fournisseur a des produits
        if ($fournisseur->produits()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce fournisseur car il est associé à des produits'
            ], 422);
        }

        $fournisseur->delete();

        return response()->json(null, 204);
    }

    /**
     * Rechercher des fournisseurs
     */
    public function search(Request $request)
    {
        $query = Fournisseur::query();

        if ($request->has('nom')) {
            $query->where('nom', 'like', '%' . $request->nom . '%');
        }

        if ($request->has('ville')) {
            $query->where('ville', 'like', '%' . $request->ville . '%');
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        $fournisseurs = $query->get();

        return response()->json($fournisseurs);
    }

    /**
     * Obtenir les statistiques des fournisseurs
     */
    public function getStatistiques()
    {
        $totalFournisseurs = Fournisseur::count();
        $fournisseursActifs = Fournisseur::where('statut', 'actif')->count();
        $fournisseursInactifs = Fournisseur::where('statut', 'inactif')->count();
        $produitsParFournisseur = Fournisseur::withCount('produits')
            ->orderBy('produits_count', 'desc')
            ->get();

        return response()->json([
            'total_fournisseurs' => $totalFournisseurs,
            'fournisseurs_actifs' => $fournisseursActifs,
            'fournisseurs_inactifs' => $fournisseursInactifs,
            'produits_par_fournisseur' => $produitsParFournisseur
        ]);
    }
} 