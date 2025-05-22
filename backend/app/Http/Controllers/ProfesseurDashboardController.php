<?php

namespace App\Http\Controllers;

use App\Models\Demande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ProfesseurDashboardController extends Controller
{
    public function getDashboardStats()
    {
        try {
            $user = Auth::user();
            Log::info('Récupération des statistiques pour le professeur', [
                'user_id' => $user->id,
                'user_role' => $user->role
            ]);

            // Récupérer toutes les demandes du professeur
            $demandes = Demande::where('utilisateur_id', $user->id)->get();

            Log::info('Demandes trouvées', [
                'count' => $demandes->count(),
                'user_id' => $user->id
            ]);

            // Calculer les statistiques générales
            $statistiques_generales = [
                'total_demandes' => $demandes->count(),
                'demandes_en_attente' => $demandes->where('statut', 'en attente')->count(),
                'demandes_en_cours' => $demandes->whereIn('statut', [
                    'envoyée au doyen',
                    'envoyée au secre'
                ])->count(),
                'demandes_finalisees' => $demandes->whereIn('statut', [
                    'traitée',
                    'refusé'
                ])->count()
            ];

            // Préparer les données pour le frontend
            $response = [
                'statistiques_generales' => $statistiques_generales,
                'demandes' => $demandes->map(function ($demande) {
                    return [
                        'id' => $demande->id,
                        'description' => $demande->description,
                        'statut' => $demande->statut,
                        'statut_label' => $this->getStatutLabel($demande->statut),
                        'date_creation' => $demande->created_at->format('Y-m-d H:i:s'),
                        'date_modification' => $demande->updated_at->format('Y-m-d H:i:s')
                    ];
                })->toArray()
            ];

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Erreur dans getDashboardStats', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);
            
            return response()->json([
                'message' => 'Une erreur est survenue lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getStatutLabel($statut)
    {
        $labels = [
            'en attente' => 'En attente',
            'envoyée au doyen' => 'Envoyée au doyen',
            'envoyée au secre' => 'Envoyée au secrétaire général',
            'traitée' => 'Traitée',
            'refusé' => 'Refusé'
        ];

        return $labels[$statut] ?? $statut;
    }
} 