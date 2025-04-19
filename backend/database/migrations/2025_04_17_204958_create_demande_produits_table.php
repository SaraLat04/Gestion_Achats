<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('demande_produits', function (Blueprint $table) {
            $table->id(); // ID primaire
            $table->foreignId('demande_id')  // Clé étrangère vers la table 'demandes'
                  ->constrained('demandes')  // Assure la contrainte avec la table 'demandes'
                  ->onDelete('cascade');    // Si une demande est supprimée, supprime également la ligne dans 'demande_produit'
            $table->foreignId('produit_id')  // Clé étrangère vers la table 'produits'
                  ->constrained('produits')  // Assure la contrainte avec la table 'produits'
                  ->onDelete('cascade');    // Si un produit est supprimé, supprime également la ligne dans 'demande_produit'
            $table->integer('quantite');     // Quantité du produit demandée
            $table->timestamps();            // Timestamps pour 'created_at' et 'updated_at'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demande_produits');
    }
};
