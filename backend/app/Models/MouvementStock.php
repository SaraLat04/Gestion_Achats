<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MouvementStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'produit_id',
        'type',
        'quantite',
        'date',
        'motif'
    ];

    protected $casts = [
        'date' => 'date',
        'quantite' => 'decimal:2'
    ];

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
} 