<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fournisseur extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'email',
        'telephone',
        'adresse',
        'ville',
        'pays',
        'code_postal',
        'site_web',
        'notes',
        'statut'
    ];

    /**
     * Relation avec les produits
     */
    public function produits(): HasMany
    {
        return $this->hasMany(Produit::class);
    }

    /**
     * Relation avec les commandes
     */
    public function commandes(): HasMany
    {
        return $this->hasMany(Commande::class);
    }

    /**
     * Vérifie si le fournisseur est actif
     */
    public function estActif(): bool
    {
        return $this->statut === 'actif';
    }

    /**
     * Formate l'adresse complète
     */
    public function getAdresseCompleteAttribute(): string
    {
        return sprintf(
            '%s, %s %s, %s',
            $this->adresse,
            $this->code_postal,
            $this->ville,
            $this->pays
        );
    }
} 