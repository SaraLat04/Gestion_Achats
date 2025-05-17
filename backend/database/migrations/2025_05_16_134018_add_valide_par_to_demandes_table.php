<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('demandes', function (Blueprint $table) {
        $table->string('valide_par')->nullable(); // chef_depa, doyen, secretaire général
    });
}

public function down()
{
    Schema::table('demandes', function (Blueprint $table) {
        $table->dropColumn('valide_par');
    });
}

};
