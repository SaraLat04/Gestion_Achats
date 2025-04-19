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
        Schema::create('produit_demandes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('demande_id');
            $table->string('nom');
            $table->integer('quantite');  
            $table->timestamps();
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('produit_demandes');
    }
};
