<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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
        'role',
        'departement',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Si tu veux caster automatiquement le rôle (optionnel, nécessite enum correct)
    // protected $casts = [
    //     'role' => UserRole::class,
    // ];

    /**
     * Relation avec les demandes
     */
    public function demandes()
    {
        return $this->hasMany(Demande::class);
    }

    /**
     * Accessor pour convertir le champ `role` en enum
     */
    public function getRoleEnumAttribute(): ?UserRole
    {
        return UserRole::tryFrom($this->role);
    }

    /**
     * Mutator pour définir le rôle en utilisant l'enum
     */
    public function setRoleEnumAttribute(UserRole $role)
    {
        $this->attributes['role'] = $role->value;
    }

    /**
     * Helpers pratiques pour tester les rôles
     */
    public function isAdmin()
    {
        return $this->role === UserRole::ADMIN->value;
    }

    public function isDemandeur()
    {
        return $this->role === UserRole::DEMANDEUR->value;
    }

    public function isProfesseur()
    {
        return $this->role === UserRole::PROFESSEUR->value;
    }

    public function isChefLabo()
    {
        return $this->role === UserRole::CHEF_LABO->value;
    }
}
