<?php

namespace App\Http\Controllers;

use App\Models\Demande;
use App\Models\ProduitDemande;
use Illuminate\Http\Request;
use App\Enums\UserRole;
use Illuminate\Support\Facades\Auth;

class DemandeController extends Controller
{
    // Lister les demandes de l'utilisateur connecté
    public function index()
    {
        $user = auth()->user();

        $demandes = Demande::with('produitsTemp')
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
    try {
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
            'statut' => 'en attente',
            'description' => $request->description,
            'justification' => $request->justification,
            'date_demande' => now(),
            'piece_jointe' => $request->hasFile('piece_jointe')
                ? $request->file('piece_jointe')->store('pieces_jointes', 'public')
                : null,
        ]);

        foreach ($request->produits as $produitData) {
            ProduitDemande::create([
                'demande_id' => $demande->id,
                'nom' => $produitData['nom'],
                'quantite' => $produitData['quantite'],
            ]);
        }

        return response()->json(['message' => 'Demande créée avec succès'], 201);
    } catch (\Exception $e) {
        \Log::error("Erreur lors de la création de la demande: " . $e->getMessage());
        return response()->json(['error' => 'Erreur interne du serveur'], 500);
    }
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

    // Récupérer toutes les demandes selon le rôle de l'utilisateur
public function all()
{
    $user = auth()->user();
    $role = $user->role;

    if ($role === 'chef_depa') {
        // Chef de département : uniquement son département
        $demandes = Demande::with('produitsTemp', 'utilisateur')
            ->where('departement', $user->departement)
            ->where(function ($query) use ($role) {
                $query->whereNot('statut', 'refusé') // toutes sauf refusées
                      ->orWhere(function ($q) use ($role) {
                          $q->where('statut', 'refusé')->where('valide_par', $role);
                      });
            })
            ->orderBy('date_demande', 'desc')
            ->get();
    } elseif ($role === 'secrétaire général') {
        $demandes = Demande::with('produitsTemp', 'utilisateur')
            ->where(function ($query) use ($role) {
                $query->whereIn('statut', ['envoyée au secre', 'traitée'])
                      ->orWhere(function ($q) use ($role) {
                          $q->where('statut', 'refusé')->where('valide_par', $role);
                      });
            })
            ->orderBy('date_demande', 'desc')
            ->get();
    } elseif ($role === 'doyen') {
        $demandes = Demande::with('produitsTemp', 'utilisateur')
            ->where(function ($query) use ($role) {
                $query->whereIn('statut', ['envoyée au doyen', 'envoyée au secre', 'traitée'])
                      ->orWhere(function ($q) use ($role) {
                          $q->where('statut', 'refusé')->where('valide_par', $role);
                      });
            })
            ->orderBy('date_demande', 'desc')
            ->get();
    } else {
        // Admin ou autre : tout voir
        $demandes = Demande::with('produitsTemp', 'utilisateur')
            ->orderBy('date_demande', 'desc')
            ->get();
    }

    return response()->json($demandes);
}


    public function sendToSecretaireGeneral($id)
{
    $user = Auth::user();
    $role = $user->role;

    \Log::info("Utilisateur connecté: " . $user->nom . " avec le rôle: " . $role);

    $demande = Demande::find($id);
    if (!$demande) {
        return response()->json(['error' => 'Demande non trouvée.'], 404);
    }

    if ($role !== 'doyen') {
        return response()->json(['error' => 'Accès refusé. Seul le doyen peut effectuer cette action.'], 403);
    }

    $demande->statut = 'envoyée au secre';
    $demande->save();

    return response()->json(['success' => 'Demande envoyée au secrétaire général avec succès.']);
}

    // Quand le chef de département valide -> envoi au doyen
    public function sendToDean($id)
    {
        $user = Auth::user();
        $role = $user->role;

        \Log::info("Utilisateur connecté: " . $user->nom . " avec le rôle: " . $role);

        $demande = Demande::find($id);
        if (!$demande) {
            return response()->json(['error' => 'Demande non trouvée.'], 404);
        }

        // Le chef de département doit être connecté ici
        if ($role !== 'chef_depa') {
            return response()->json(['error' => 'Accès refusé. Vous n\'êtes pas le chef de département.'], 403);
        }

        $demande->statut = 'envoyée au doyen';
        $demande->save();

        return response()->json(['success' => 'Demande envoyée au doyen avec succès.']);
    }




    // Quand le secrétaire général valide -> demande traitée
    public function finaliserDemande($id)
    {
        $user = Auth::user();
        $role = $user->role;

        \Log::info("Utilisateur connecté: " . $user->nom . " avec le rôle: " . $role);

        $demande = Demande::find($id);
        if (!$demande) {
            \Log::error("Demande avec l'ID $id non trouvée.");
            return response()->json(['error' => 'Demande non trouvée.'], 404);
        }

        // Le secrétaire général doit être connecté ici
        if ($role !== 'secrétaire général') {
            \Log::error("Accès refusé. L'utilisateur avec le rôle $role n'est pas secrétaire général.");
            return response()->json(['error' => 'Accès refusé. Vous n\'êtes pas le secrétaire général.'], 403);
        }

        $demande->statut = 'traitée';
        $demande->valide_par = $role;
        $demande->save();


        return response()->json(['success' => 'Demande traitée avec succès.']);
    }

    public function reject($id)
{
    $demande = Demande::findOrFail($id);

    $demande->statut = 'refusé';
    $demande->valide_par = auth()->user()->role; // 👈 on stocke qui a rejeté
    $demande->save();

    return response()->json(['message' => 'Demande refusée avec succès']);
}


    public function getNotifications()
{
    $user = auth()->user();
    $role = $user->role;

    // En fonction du rôle, on filtre sur le statut attendu
    if ($role === 'secrétaire général') {
        $demandes = Demande::where('statut', 'envoyée au secre')
            ->orderBy('date_demande', 'desc')->get();
    } elseif ($role === 'doyen') {
        $demandes = Demande::where('statut', 'envoyée au doyen')
            ->orderBy('date_demande', 'desc')->get();
    } elseif ($role === 'chef_depa') {
        $demandes = Demande::where('statut', 'en attente')
            ->orderBy('date_demande', 'desc')->get();
    } elseif ($role === 'professeur') {
        $demandes = Demande::where('utilisateur_id', $user->id)
            ->orderBy('date_demande', 'desc')->get();
    } else {
        // Rôle non géré : renvoyer une liste vide ou une erreur
        $demandes = collect(); // collection vide
        // ou bien :
        // return response()->json(['error' => 'Rôle non reconnu'], 403);
    }

    return response()->json($demandes);
}



}

