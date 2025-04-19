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
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('utilisateur_id')->constrained('utilisateurs')->onDelete('cascade');
            $table->string('departement');
            $table->text('description');
            $table->dateTime('date_demande')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->text('justification');
            $table->string('piece_jointe')->nullable();
            $table->enum('statut', ['en_attente', 'validee', 'rejetee'])->default('en_attente');
            $table->timestamps();
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};
