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
            'statut' => 'en attente',
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

        // if ($demande->utilisateur_id !== auth()->id()) {
        //     return response()->json(['error' => 'Non autorisé'], 403);
        // }

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

    public function all()
    {
        $user = auth()->user();

        if ($user->role === 'doyen') {
            // Le doyen voit les demandes envoyées au doyen, envoyées au responsable financier, ou traitées
            $demandes = Demande::with('produitsTemp', 'utilisateur')
                ->whereIn('statut', ['envoyée au doyen', 'envoyée au responsable financier', 'traitée'])
                ->orderBy('date_demande', 'desc')
                ->get();
        } elseif ($user->role === 'responsable financier') {
            // Le responsable financier voit les demandes envoyées à lui, ou traitées
            $demandes = Demande::with('produitsTemp', 'utilisateur')
                ->whereIn('statut', ['envoyée au responsable financier', 'traitée'])
                ->orderBy('date_demande', 'desc')
                ->get();
        } else {
            // Les autres (ex: secrétaire générale) voient toutes les demandes
            $demandes = Demande::with('produitsTemp', 'utilisateur')
                ->orderBy('date_demande', 'desc')
                ->get();
        }

        return response()->json($demandes);
    }





    public function sendToDean($id)
    {
        // Récupérer l'utilisateur connecté et afficher son rôle pour vérification
        $user = Auth::user();
        $role = $user->role;

        // Afficher ou retourner le rôle de l'utilisateur connecté (pour vérifier)
        \Log::info("Utilisateur connecté: " . $user->nom . " avec le rôle: " . $role);

        // Vérifier que l'utilisateur connecté est la secrétaire générale
        // if ($role !== UserRole::DEMANDEUR) {
        //      return response()->json(['error' => 'Accès refusé. Vous n\'êtes pas la secrétaire générale.'], 403);
        //  }

        // Récupérer la demande par son ID
        $demande = Demande::find($id);
        if (!$demande) {
            return response()->json(['error' => 'Demande non trouvée.'], 404);
        }

        // Mettre à jour l'état de la demande pour indiquer qu'elle a été validée par la secrétaire générale
        $demande->statut = 'envoyée au doyen';  // ou un autre état selon ton modèle
        $demande->save();

        // Une fois la validation effectuée par la secrétaire générale, l'envoyer au doyen
        // Tu pourrais par exemple notifier le doyen ici via un email ou une notification interne.
        // Si tu veux une logique simple, tu peux juste retourner une confirmation ici.

        return response()->json(['success' => 'Demande envoyée au doyen avec succès.']);
    }

    // Quand le doyen valide -> envoi au responsable financier
    public function sendToResponsable($id)
    {
        $user = Auth::user();
        $role = $user->role;

        \Log::info("Utilisateur connecté: " . $user->nom . " avec le rôle: " . $role);

        $demande = Demande::find($id);
        if (!$demande) {
            return response()->json(['error' => 'Demande non trouvée.'], 404);
        }

        // Le doyen doit être connecté ici
        if ($role !== 'doyen') {
            return response()->json(['error' => 'Accès refusé. Vous n\'êtes pas le doyen.'], 403);
        }

        $demande->statut = 'envoyée au responsable financier';
        $demande->save();

        return response()->json(['success' => 'Demande envoyée au responsable financier avec succès.']);
    }

    // Quand le responsable financier valide -> demande traitée
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

        if ($role !== 'responsable financier') {
            \Log::error("Accès refusé. L'utilisateur avec le rôle $role n'est pas un responsable financier.");
            return response()->json(['error' => 'Accès refusé. Vous n\'êtes pas le responsable financier.'], 403);
        }

        $demande->statut = 'traitée';
        $demande->save();

        return response()->json(['success' => 'Demande traitée avec succès.']);
    }
    public function reject($id)
    {
        $demande = Demande::findOrFail($id);

        $demande->statut = 'refusé'; // Attention ici à l'orthographe
        $demande->save();

        return response()->json(['message' => 'Demande refusée avec succès']);
    }
    public function getNotifications()
    {
        $user = auth()->user();
        $role = $user->role;

        // En fonction du rôle, on filtre sur le statut attendu
        if ($role === 'secrétaire général') {
            $demandes = Demande::where('statut', 'en attente')->orderBy('date_demande', 'desc')->get();
        } elseif ($role === 'doyen') {
            $demandes = Demande::where('statut', 'envoyée au doyen')->orderBy('date_demande', 'desc')->get();
        } elseif ($role === 'responsable financier') {
            $demandes = Demande::where('statut', 'envoyée au responsable financier')->orderBy('date_demande', 'desc')->get();
        } elseif ($role === 'professeur' || $role === 'chef_depa' || $role === 'directeur labo') {
            $demandes = Demande::whereIn('statut', ['traitée', 'refusé'])
                ->orderBy('date_demande', 'desc')->get();
        } else {
            $demandes = collect(); // Vide pour les autres
        }

        return response()->json($demandes);
    }

}
