import React, { useReducer } from "react";
import {
  TextField,
  Button,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Box,
  Stack
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const initialState = {
  description: "",
  produits: [],
  produitNom: "",
  produitQte: "",
  justification: "",
  fichier: null
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "ADD_PRODUIT":
      return state.produitNom && state.produitQte
        ? {
            ...state,
            produits: [...state.produits, { nom: state.produitNom, quantite: state.produitQte }],
            produitNom: "",
            produitQte: ""
          }
        : state;
    case "REMOVE_PRODUIT":
      return { ...state, produits: state.produits.filter((_, i) => i !== action.index) };
    case "SET_FILE":
      return { ...state, fichier: action.file };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function AddDemande() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const envoyerDemande = () => {
    console.log({ nom: "Demandeur", email: "demandeur@gmail.com", departement: "Informatique", ...state });
    alert("Demande envoyée avec succès !");
  };

  // Fonction pour gérer la sélection du fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    dispatch({ type: "SET_FILE", file });
  };

  return (
    <Box display="flex" justifyContent="center" mt={5}>
      <Card elevation={3} sx={{ width: '80%', padding: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" color="primary" fontWeight="bold">
            Créer une Demande
          </Typography>
          <TextField
            label="Nom du demandeur"
            value="Demandeur"
            fullWidth
            margin="normal"
            disabled
            variant="outlined"
          />
          <TextField
            label="Email du demandeur"
            value="demandeur@gmail.com"
            fullWidth
            margin="normal"
            disabled
            variant="outlined"
          />
          <TextField
            label="Département"
            value="Informatique"
            fullWidth
            margin="normal"
            disabled
            variant="outlined"
          />
          <TextField
            label="Description de la demande"
            value={state.description}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "description", value: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            variant="outlined"
          />
          <TextField
            label="Justification"
            value={state.justification}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "justification", value: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            variant="outlined"
          />
          
          <Box sx={{ marginTop: 2, display: "flex", alignItems: "center" }}>
            <IconButton 
              color="primary" 
              component="label" 
              sx={{ border: "1px solid #ddd", padding: 1, borderRadius: 1, fontSize: 40 }}
            >
              <CloudUploadIcon sx={{ fontSize: 40 }} />
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                hidden
                onChange={handleFileChange}
              />
            </IconButton>
            <Typography variant="body1" color="primary" ml={2}>
              Télécharger un fichier
            </Typography>
            {state.fichier && (
              <Typography variant="body2" color="textSecondary" ml={2}>
                Fichier choisi: {state.fichier.name}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 3 }}>
            <Box flex={1}>
              <TextField
                label="Nom du produit"
                value={state.produitNom}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "produitNom", value: e.target.value })}
                fullWidth
                variant="outlined"
              />
            </Box>
            <Box flex={1}>
              <TextField
                label="Quantité"
                type="number"
                value={state.produitQte}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "produitQte", value: e.target.value })}
                fullWidth
                variant="outlined"
              />
            </Box>
            <IconButton color="primary" onClick={() => dispatch({ type: "ADD_PRODUIT" })} size="large">
              <AddIcon fontSize="inherit" />
            </IconButton>
          </Stack>
          {state.produits.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell><b>Nom du produit</b></TableCell>
                    <TableCell><b>Quantité</b></TableCell>
                    <TableCell><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.produits.map((produit, index) => (
                    <TableRow key={index}>
                      <TableCell>{produit.nom}</TableCell>
                      <TableCell>{produit.quantite}</TableCell>
                      <TableCell>
                        <IconButton color="secondary" onClick={() => dispatch({ type: "REMOVE_PRODUIT", index })}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
            <Button variant="contained" color="primary" onClick={envoyerDemande} sx={{ borderRadius: 2, padding: "10px 20px" }}>
              Envoyer
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => dispatch({ type: "RESET" })}
              sx={{ borderRadius: 2, padding: "10px 20px" }}
            >
              Annuler
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
