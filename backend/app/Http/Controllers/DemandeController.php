<?php

namespace App\Http\Controllers;

use App\Models\Demande;
use App\Models\ProduitDemande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DemandeController extends Controller
{
    // Retourner les demandes de l'utilisateur connecté
public function index()
{
    $user = auth()->user();

    // Si tu veux retourner uniquement les demandes de l'utilisateur connecté
    $demandes = Demande::with('produitsTemp') // ou 'produits' selon ta relation
        ->where('utilisateur_id', $user->id)
        ->orderBy('date_demande', 'desc')
        ->get();

    return response()->json($demandes);
}

    // Afficher le formulaire de création de demande
    public function create()
    {
        $user = auth()->user();
        return view('demandes.create', compact('user'));
    }

    // Enregistrer une nouvelle demande
    public function store(Request $request)
    {
        $user = auth()->user(); // L'utilisateur connecté
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

        // Création de la demande avec l'ID de l'utilisateur connecté
        $demande = Demande::create([
            'utilisateur_id' => $user->id,
            'departement' => $user->departement ?? 'Non défini', // ou une autre logique
            'statut' => 'en_attente',
            'description' => $request->description,
            'justification' => $request->justification,
            'date_demande' => now(),
            'piece_jointe' => $request->hasFile('piece_jointe')
                ? $request->file('piece_jointe')->store('pieces_jointes')
                : null,
        ]);

        // Gestion des produits
        foreach ($request->produits as $produitData) {
            // Crée ou récupère le produit
            ProduitDemande::create([
                'demande_id' => $demande->id,
                'nom' => $produitData['nom'],
                'quantite' => $produitData['quantite'],
            ]);


        }

        return response()->json(['message' => 'demande créé avec succès'], 201);
    }

    public function update(Request $request, $id)
    {
        $demande = Demande::findOrFail($id);

        // Vérifie que l'utilisateur est bien le propriétaire de la demande
        if ($demande->utilisateur_id !== auth()->id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        // Validation
        $request->validate([
            'description' => 'sometimes|required|string|max:255',
            'justification' => 'sometimes|required|string|max:255',
            'piece_jointe' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'produits' => 'sometimes|array',
            'produits.*.nom' => 'required_with:produits|string',
            'produits.*.quantite' => 'required_with:produits|integer|min:1',
        ]);

        // Mise à jour des champs de la demande
        $demande->description = $request->description ?? $demande->description;
        $demande->justification = $request->justification ?? $demande->justification;

        if ($request->hasFile('piece_jointe')) {
            $demande->piece_jointe = $request->file('piece_jointe')->store('pieces_jointes');
        }

        $demande->save();

        // Mise à jour des produits temporaires (produit_demandes)
        if ($request->has('produits')) {
            // Supprimer les anciens produits liés (temp)
            $demande->produitsTemp()->delete();

            // Ajouter les nouveaux produits
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

        // Vérifie que l'utilisateur est bien le propriétaire de la demande
        if ($demande->utilisateur_id !== auth()->id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        // Supprimer les produits temporaires associés (dans produit_demandes)
        $demande->produitsTemp()->delete();

        // Supprimer la demande
        $demande->delete();

        return response()->json(['message' => 'Demande supprimée avec succès']);
    }

}
