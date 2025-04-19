<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Demande;


class Produit extends Model
{
    use HasFactory;
    protected $fillable = [
        'nom',
        'description',
        'prix',
        'quantite_stock',
    ];

    public function demandes()
    {
        return $this->belongsToMany(Demande::class, 'demande_produit')
            ->withPivot('quantite');
    }
}
