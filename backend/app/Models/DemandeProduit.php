<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Demande;
use App\Models\Produit;

class DemandeProduit extends Model
{
    use HasFactory;

    protected $table = 'demande_produits';

    // Champs qui peuvent être remplis
    protected $fillable = [
        'demande_id',
        'produit_id',
        'quantite',
    ];

    // Relation avec la demande (belongsTo)
    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }

    // Relation avec le produit (belongsTo)
    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
}
