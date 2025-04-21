<?php

namespace App\Http\Controllers;

use App\Models\Demande;
use App\Models\ProduitDemande;
use Illuminate\Http\Request;

class DemandeController extends Controller
{
    // Lister les demandes de l'utilisateur connecté
    public function index()
    {
        $user = auth()->user();

        $demandes = Demande::with('produitsTemp') // Assure-toi que la relation 'produitsTemp' est définie
            ->where('utilisateur_id', $user->id)
            ->orderBy('date_demande', 'desc')
            ->get();

        return response()->json($demandes);
    }

    // Afficher le formulaire de création
    public function create()
    {
        $user = auth()->user();
        return view('demandes.create', compact('user'));
    }

    // Enregistrer une nouvelle demande
    public function store(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $request->validate([
            'description' => 'required|string|max:255',
            'justification' => 'required|string|max:255',
            'piece_jointe' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'produits' => 'required|array',
            'produits.*.nom' => 'required|string',
            'produits.*.quantite' => 'required|integer|min:1',
        ]);

        $demande = Demande::create([
            'utilisateur_id' => $user->id,
            'departement' => $user->departement ?? 'Non défini',
            'statut' => 'en_attente',
            'description' => $request->description,
            'justification' => $request->justification,
            'date_demande' => now(),
            'piece_jointe' => $request->hasFile('piece_jointe')
                ? $request->file('piece_jointe')->store('pieces_jointes')
                : null,
        ]);

        // Enregistrement des produits
        foreach ($request->produits as $produitData) {
            ProduitDemande::create([
                'demande_id' => $demande->id,
                'nom' => $produitData['nom'],
                'quantite' => $produitData['quantite'],
            ]);
        }

        return response()->json(['message' => 'Demande créée avec succès'], 201);
    }

    public function update(Request $request, $id)
    {
        $demande = Demande::findOrFail($id);

        if ($demande->utilisateur_id !== auth()->id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $request->validate([
            'description' => 'sometimes|required|string|max:255',
            'justification' => 'sometimes|required|string|max:255',
            'piece_jointe' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'produits' => 'sometimes|array',
            'produits.*.nom' => 'required_with:produits|string',
            'produits.*.quantite' => 'required_with:produits|integer|min:1',
        ]);

        $demande->description = $request->input('description', $demande->description);
        $demande->justification = $request->input('justification', $demande->justification);

        if ($request->hasFile('piece_jointe')) {
            $demande->piece_jointe = $request->file('piece_jointe')->store('pieces_jointes');
        }

        $demande->save();

        // Mise à jour des produits
        if ($request->has('produits')) {
            $demande->produitsTemp()->delete();

            foreach ($request->produits as $produitData) {
                $demande->produitsTemp()->create([
                    'nom' => $produitData['nom'],
                    'quantite' => $produitData['quantite'],
                ]);
            }
        }

        return response()->json(['message' => 'Demande modifiée avec succès']);
    }

    public function destroy($id)
    {
        $demande = Demande::findOrFail($id);

        if ($demande->utilisateur_id !== auth()->id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $demande->produitsTemp()->delete();
        $demande->delete();

        return response()->json(['message' => 'Demande supprimée avec succès']);
    }

    public function getStatistiques()
    {
        return response()->json([
            'totalDemandes' => Demande::count(),
            'demandesValide' => Demande::where('statut', Demande::STATUT_VALIDE)->count(),
            'demandesEnAttente' => Demande::where('statut', Demande::STATUT_EN_ATTENTE)->count(),
            'demandesRefuse' => Demande::where('statut', Demande::STATUT_REFUSE)->count(),
        ]);
    }
}
