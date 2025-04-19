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

    protected $fillable = [
        'utilisateur_id',
        'statut',
        'date_demande',
        'description',
        'justification',
        'piece_jointe',
        'departement'
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    // Produits avant validation
    public function produitsTemp()
    {
        return $this->hasMany(ProduitDemande::class);
    }

    // Produits validés
    public function produits()
    {
        return $this->belongsToMany(Produit::class, 'demande_produit')
            ->withPivot('quantite');
    }
}
