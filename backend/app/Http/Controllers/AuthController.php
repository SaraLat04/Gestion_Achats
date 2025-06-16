<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Enums\UserRole;
use App\Enums\Departement;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{

    public function register(Request $request)
    {
        $request->validate([
    'nom' => 'required|string',
    'prenom' => 'required|string',
    'email' => 'required|email|unique:utilisateurs',
    'password' => 'required|min:6',
    'role' => 'required|string',
    'departement' => 'required|string',
    'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
]);

$photoPath = null;

if ($request->hasFile('photo')) {
    $photoPath = $request->file('photo')->store('photos', 'public');
}
$user = Utilisateur::create([
    'nom' => $request->nom,
    'prenom' => $request->prenom,
    'email' => $request->email,
    'password' => Hash::make($request->password),
    'role' => $request->role,
    'departement' => $request->departement,
    'photo' => $photoPath,
]);

$user->photo = $photoPath ? asset('storage/' . $photoPath) : null;

return response()->json([
    'message' => 'Utilisateur créé avec succès',
    'user' => $user
], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
$user->photo = $user->photo ? asset('storage/' . $user->photo) : null;

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Connexion réussie',
                'token' => $token,
                'user' => $user
            ]);
        }

        return response()->json(['message' => 'Identifiants invalides'], 401);
    }

    public function getRoles()
    {
        // Récupère les valeurs de l'énumération UserRole
        $roles = UserRole::cases();

        // Retourne les rôles sous forme de tableau
        return response()->json($roles);
    }



public function getDepartements()
{
    $departements = Departement::cases();
    return response()->json($departements);
}

public function getUserById($id)
{
    $user = Utilisateur::find($id);

    if (!$user) {
        return response()->json(['message' => 'Utilisateur non trouvé'], 404);
    }

    // Format photo avec URL complète
    if ($user->photo) {
        $user->photo = asset('storage/' . $user->photo);
    }

    return response()->json($user);
}

public function updateProfile(Request $request)
{
    $user = auth()->user();

    if (!$user) {
        return response()->json(['message' => 'Utilisateur non authentifié'], 401);
    }

    $request->validate([
        'nom' => 'required|string|max:255',
        'prenom' => 'required|string|max:255',
        'email' => 'required|email|max:255',
        'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    $user->nom = $request->nom;
    $user->prenom = $request->prenom;
    $user->email = $request->email;

    if ($request->hasFile('photo')) {
    if ($user->photo && Storage::disk('public')->exists($user->photo)) {
        Storage::disk('public')->delete($user->photo);
    }
    $path = $request->file('photo')->store('photos', 'public');
    $user->photo = $path;
}


$user->save();

// Génère l'URL publique avant de renvoyer la réponse
$user->photo = $user->photo ? asset('storage/' . $user->photo) : null;

return response()->json(['message' => 'Profil mis à jour avec succès', 'user' => $user]);

}


}


