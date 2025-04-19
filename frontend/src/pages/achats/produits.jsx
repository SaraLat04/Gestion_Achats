import React from "react";
import { Grid, Box, Stack, Typography } from "@mui/material";
import MUIDataTable from "mui-datatables";
import Dot from "components/@extended/Dot"; // Assure-toi que le composant Dot est défini ou importé correctement

// Données produits (comme précédemment)
const datatableData = [
  [1, "Produit 1", "Description du produit 1", 1400, 3],
  [2, "Produit 2", "Description du produit 2", 1500, 3],
  [3, "Produit 3", "Description du produit 3", 500, 3],
  [4, "Produit 4", "Description du produit 4", 600, 3],
  [5, "Produit 5", "Description du produit 5", 800, 3],

  // Ajoute d'autres produits si nécessaire
];

// Fonction pour générer un statut avec des cercles colorés (Dot)
function StatusDot({ status }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Dot
        color={status === 0 ? "transparent" : "warning"}
        borderColor={status === 0 ? "warning" : "transparent"}
        variant={status === 0 ? "outlined" : "filled"}
      />
      <Dot
        color={status === 1 ? "transparent" : "success"}
        borderColor={status === 1 ? "success" : "transparent"}
        variant={status === 1 ? "outlined" : "filled"}
      />
      <Dot
        color={status === 2 ? "transparent" : "error"}
        borderColor={status === 2 ? "error" : "transparent"}
        variant={status === 2 ? "outlined" : "filled"}
      />
    </Stack>
  );
}

function Products() {
  const columns = [
    "Numéro", 
    "Nom", 
    "Description", 
    "Prix (DH)", 
    "Quantité", 
    
  ];

  const options = {
    filterType: "checkbox",
    selectableRows: "none", 
    responsive: "standard",
    search: true,
    pagination: true,
    print: false,
    download: false,
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <MUIDataTable
          title="Liste des Produits"
          data={datatableData}
          columns={columns}
          options={options}
        />
      </Grid>
    </Grid>
  );
}

export default Products;
