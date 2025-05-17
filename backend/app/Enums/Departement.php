<?php

namespace App\Enums;

enum Departement: string
{
    case MATHEMATIQUES = 'Mathematiques';
    case PHYSIQUE = 'Physique appliquée';
    case CHIMIE = 'Sciences Chimiques';
    case BIOLOGIE = 'Biologie';
    case TERRE = 'Sciences de la terre';
    case GENIE_CIVIL = 'Génie Civil';
    case INFORMATIQUE = 'Informatique';
    case TCM = 'Techniques de Communication et Management';
    case ADMINISTRATION = 'Administration';
}
