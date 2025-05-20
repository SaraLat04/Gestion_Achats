<?php

namespace App\Http\Controllers;

use App\Models\ProduitDemande;
use Illuminate\Http\Request;

class ProduitDemandeController extends Controller
{
    public function getProduitsByDemande($demandeId)
    {
        $produits = ProduitDemande::where('demande_id', $demandeId)->get();

        return response()->json($produits);
    }
}
