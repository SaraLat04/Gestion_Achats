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
        Schema::table('produits', function (Blueprint $table) {
            // Ajout ou modification des colonnes nécessaires
            if (!Schema::hasColumn('produits', 'code')) {
                $table->string('code')->unique();
            }
            if (!Schema::hasColumn('produits', 'nom')) {
                $table->string('nom');
            }
            if (!Schema::hasColumn('produits', 'marque')) {
                $table->string('marque');
            }
            if (!Schema::hasColumn('produits', 'categorie_id')) {
                $table->foreignId('categorie_id')->constrained('categories');
            }
            if (!Schema::hasColumn('produits', 'quantite')) {
                $table->decimal('quantite', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('produits', 'unite')) {
                $table->string('unite');
            }
            if (!Schema::hasColumn('produits', 'prix')) {
                $table->decimal('prix', 10, 2);
            }
            if (!Schema::hasColumn('produits', 'image')) {
                $table->string('image')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            // Ne rien faire dans le down pour éviter de perdre des données
        });
    }
}; 