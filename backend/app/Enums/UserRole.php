<?php

namespace App\Enums;

enum UserRole: string
{
  case ADMIN = 'doyen';
  case DEMANDEUR = 'secrétaire général';
  case PROFESSEUR = 'professeur';
  case CHEF_LABO = 'directeur labo';
  case MAGASINIER = 'mgasinier';

  case CHEF_DEPARTEMENT = "chef_depa";
  case RESPONSABLE_FINANCIER = 'responsable financier';


}
