<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Produit;
use App\Models\Utilisateur;
use App\Models\ProduitDemande;

class Demande extends Model
{
    use HasFactory;

    // Constantes pour les statuts de la demande
    const STATUT_EN_ATTENTE = 'en attente';
    const STATUT_VALIDE = 'validé';
    const STATUT_REFUSE = 'refusé';

    protected $fillable = [
        'utilisateur_id',
        'statut',
        'date_demande',
        'description',
        'justification',
        'piece_jointe',
        'departement'
    ];

    /**
     * Relation avec l'utilisateur ayant fait la demande
     */
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    /**
     * Produits temporairement associés à la demande (avant validation)
     */
    public function produitsTemp()
    {
        return $this->hasMany(ProduitDemande::class);
    }

    /**
     * Produits validés associés à la demande
     */
    public function produits()
    {
        return $this->belongsToMany(Produit::class, 'demande_produit')
            ->withPivot('quantite');
    }

    /**
     * Accesseur pour afficher un label lisible pour le statut
     */
    public function getStatutLabelAttribute()
    {
        switch ($this->statut) {
            case self::STATUT_EN_ATTENTE:
                return 'En attente';
            case self::STATUT_VALIDE:
                return 'Validé';
            case self::STATUT_REFUSE:
                return 'Refusé';
            default:
                return 'Inconnu';
        }
    }
}
