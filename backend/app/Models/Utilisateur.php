<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Demande;

class Utilisateur extends Authenticatable
{

    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'role'
    ];

    public function demandes()
    {
        return $this->hasMany(Demande::class);
    }
    
}
