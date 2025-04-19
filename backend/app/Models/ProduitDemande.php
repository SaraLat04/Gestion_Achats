<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProduitDemande extends Model
{
    use HasFactory;

    protected $table = 'produit_demandes';

    protected $fillable = [
        'demande_id',
        'nom',
        'quantite',
    ];

}
