<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Demande;

class Produit extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'nom',
        'marque',
        'categorie_id',
        'quantite',
        'unite',
        'prix',
        'image'
    ];

    protected $casts = [
        'quantite' => 'decimal:2',
        'prix' => 'decimal:2'
    ];

    /**
     * Relation avec la catégorie
     */
    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class);
    }

    /**
     * Relation avec le fournisseur
     */
    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(Fournisseur::class);
    }

    /**
     * Relation avec les mouvements de stock
     */
    public function mouvements(): HasMany
    {
        return $this->hasMany(MouvementStock::class);
    }

    /**
     * Vérifie si le stock est en alerte
     */
    public function estEnAlerte(): bool
    {
        return $this->quantite_stock <= $this->seuil_alerte;
    }

    /**
     * Calcule la valeur du stock
     */
    public function valeurStock(): float
    {
        return $this->quantite_stock * $this->prix_unitaire;
    }

    public function demandes()
    {
        return $this->belongsToMany(Demande::class, 'demande_produit')
            ->withPivot('quantite');
    }
}
