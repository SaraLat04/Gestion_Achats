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


public function up()
{
    DB::statement("ALTER TABLE demandes MODIFY statut ENUM(
        'en attente',
        'validé',
        'refusé',
        'envoyée au doyen',
        'envoyée au secre',
        'envoyée au responsable financier',
        'traitée'
    ) NOT NULL DEFAULT 'en attente'");
}

public function down()
{
    DB::statement("ALTER TABLE demandes MODIFY statut ENUM(
        'en attente',
        'validé',
        'refusé'
    ) NOT NULL DEFAULT 'en attente'");
}

};
