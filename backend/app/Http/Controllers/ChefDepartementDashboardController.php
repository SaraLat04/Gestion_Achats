<?php

namespace App\Http\Controllers;

use App\Models\Demande;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ChefDepartementDashboardController extends Controller
{
    // Constantes pour les statuts
    private const STATUT_EN_ATTENTE = 'en attente';
    private const STATUT_ENVOYEE_DOYEN = 'envoyée au doyen';
    private const STATUT_TRAITEE = 'traitée';
    private const STATUT_REFUSEE = 'refusé';

    public function getDashboardStats()
    {
        $user = null;
        try {
            $user = auth()->user();
            
            if (!$user) {
                Log::error('Utilisateur non authentifié');
                return response()->json(['error' => 'Non authentifié'], 401);
            }

            Log::info('Début récupération des statistiques pour le chef de département', [
                'user_id' => $user->id,
                'role' => $user->role,
                'departement' => $user->departement
            ]);

            // Vérifier le rôle
            if ($user->role !== 'chef_depa') {
                Log::error('Accès non autorisé au dashboard chef de département', [
                    'user_id' => $user->id,
                    'role' => $user->role
                ]);
                return response()->json(['error' => 'Accès non autorisé'], 403);
            }

            // Vérifier si le département est défini
            if (empty($user->departement)) {
                Log::error('Département non défini pour le chef de département', [
                    'user_id' => $user->id
                ]);
                return response()->json(['error' => 'Département non défini'], 400);
            }

            // Vérifier si le département existe dans la table des demandes
            $departementExists = DB::table('demandes')
                ->where('departement', $user->departement)
                ->exists();

            if (!$departementExists) {
                Log::info('Aucune demande trouvée pour le département', [
                    'departement' => $user->departement
                ]);
                return response()->json([
                    'statistiques_generales' => [
                        'total_demandes' => 0,
                        'demandes_en_attente' => 0,
                        'demandes_envoyees_doyen' => 0,
                        'demandes_finalisees' => 0,
                        'demandes_par_departement' => [
                            $user->departement => [
                                'total' => 0,
                                'en_attente' => 0,
                                'envoyees_doyen' => 0,
                                'finalisees' => 0
                            ]
                        ]
                    ],
                    'demandes' => []
                ]);
            }

            // Récupérer les demandes avec une requête optimisée
            $demandes = Demande::select([
                    'demandes.id',
                    'demandes.description',
                    'demandes.statut',
                    'demandes.created_at',
                    'demandes.departement',
                    'users.nom',
                    'users.prenom'
                ])
                ->leftJoin('users', 'demandes.utilisateur_id', '=', 'users.id')
                ->where('demandes.departement', $user->departement)
                ->with(['produits:id,demande_id'])
                ->orderBy('demandes.created_at', 'desc')
                ->get();

            Log::info('Demandes récupérées', [
                'user_id' => $user->id,
                'departement' => $user->departement,
                'total_demandes' => $demandes->count(),
                'statuts' => $demandes->pluck('statut')->unique()->values()
            ]);

            // Calculer les statistiques avec des requêtes optimisées
            $statistiques = [
                'total_demandes' => $demandes->count(),
                'demandes_en_attente' => $demandes->where('statut', self::STATUT_EN_ATTENTE)->count(),
                'demandes_envoyees_doyen' => $demandes->where('statut', self::STATUT_ENVOYEE_DOYEN)->count(),
                'demandes_finalisees' => $demandes->whereIn('statut', [self::STATUT_TRAITEE, self::STATUT_REFUSEE])->count(),
                'demandes_par_departement' => [
                    $user->departement => [
                        'total' => $demandes->count(),
                        'en_attente' => $demandes->where('statut', self::STATUT_EN_ATTENTE)->count(),
                        'envoyees_doyen' => $demandes->where('statut', self::STATUT_ENVOYEE_DOYEN)->count(),
                        'finalisees' => $demandes->whereIn('statut', [self::STATUT_TRAITEE, self::STATUT_REFUSEE])->count()
                    ]
                ]
            ];

            // Préparer les données pour le frontend
            $response = [
                'statistiques_generales' => $statistiques,
                'demandes' => $demandes->map(function ($demande) {
                    return [
                        'id' => $demande->id,
                        'description' => $demande->description,
                        'statut' => $demande->statut,
                        'statut_label' => $this->getStatutLabel($demande->statut),
                        'date_creation' => $demande->created_at->format('Y-m-d H:i:s'),
                        'departement' => $demande->departement,
                        'utilisateur' => [
                            'nom' => $demande->nom ?? 'N/A',
                            'prenom' => $demande->prenom ?? 'N/A'
                        ],
                        'produits_count' => $demande->produits->count()
                    ];
                })->values()
            ];

            Log::info('Statistiques préparées avec succès', [
                'user_id' => $user->id,
                'departement' => $user->departement,
                'total_demandes' => $statistiques['total_demandes'],
                'en_attente' => $statistiques['demandes_en_attente'],
                'envoyees_doyen' => $statistiques['demandes_envoyees_doyen'],
                'finalisees' => $statistiques['demandes_finalisees']
            ]);

            return response()->json($response);

        } catch (ModelNotFoundException $e) {
            Log::error('Ressource non trouvée', [
                'user_id' => $user?->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Ressource non trouvée'], 404);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des statistiques', [
                'user_id' => $user?->id,
                'departement' => $user?->departement,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Erreur lors de la récupération des statistiques',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function getStatutLabel($statut)
    {
        return match($statut) {
            self::STATUT_EN_ATTENTE => 'En attente de validation',
            self::STATUT_ENVOYEE_DOYEN => 'Envoyée au doyen',
            self::STATUT_TRAITEE => 'Traitée',
            self::STATUT_REFUSEE => 'Refusée',
            default => $statut
        };
    }
} 