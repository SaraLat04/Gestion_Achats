<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->decimal('quantite', 10, 2)->default(0)->after('categorie_id');
            $table->decimal('prix', 10, 2)->after('quantite');
            $table->string('unite')->after('prix');
        });

        // Copier les données des anciennes colonnes vers les nouvelles
        DB::statement('UPDATE produits SET quantite = quantite_stock, prix = prix_unitaire, unite = unite_mesure');

        // Supprimer les anciennes colonnes
        Schema::table('produits', function (Blueprint $table) {
            $table->dropColumn(['quantite_stock', 'prix_unitaire', 'unite_mesure']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->decimal('quantite_stock', 10, 2)->default(0)->after('categorie_id');
            $table->decimal('prix_unitaire', 10, 2)->after('quantite_stock');
            $table->string('unite_mesure')->after('prix_unitaire');
        });

        // Copier les données des nouvelles colonnes vers les anciennes
        DB::statement('UPDATE produits SET quantite_stock = quantite, prix_unitaire = prix, unite_mesure = unite');

        // Supprimer les nouvelles colonnes
        Schema::table('produits', function (Blueprint $table) {
            $table->dropColumn(['quantite', 'prix', 'unite']);
        });
    }
}; 