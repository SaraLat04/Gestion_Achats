import PropTypes from 'prop-types';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Print as PrintIcon, Description as PdfIcon } from '@mui/icons-material';

// project imports
import Dot from 'components/@extended/Dot';

function createData(request_no, user_name, request_type, pdf_link) {
  return { request_no, user_name, request_type, pdf_link };
}

const rows = [
  createData(84564564, 'John Doe', 'Achat Matériel', 'demande1.pdf'),
  createData(98764564, 'Sara Smith', 'Requête Document', 'demande2.pdf'),
  createData(98756325, 'Alex Johnson', 'Achat Logiciel', 'demande3.pdf'),
  createData(98652366, 'Emily Davis', 'Formation', 'demande4.pdf'),
  createData(13286564, 'Michael Brown', 'Achat Matériel', 'demande5.pdf'),
  createData(86739658, 'Anna Wilson', 'Achat Matériel', 'demande6.pdf'),
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'request_no', align: 'left', disablePadding: false, label: 'Numéro de demande' },
  { id: 'user_name', align: 'left', disablePadding: true, label: 'Nom de l\'utilisateur' },
  { id: 'request_type', align: 'left', disablePadding: false, label: 'Type de demande' },
  { id: 'actions', align: 'left', disablePadding: false, label: 'Actions' },
];

// ==============================|| ORDER TABLE - HEADER ||============================== //

function RequestTableHead({ order, orderBy }) {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// ==============================|| TABLEAU DE SUIVI DES DEMANDES ||============================== //

export default function RequestTable() {
  const order = 'asc';
  const orderBy = 'request_no';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <TableContainer sx={{ width: '100%', overflowX: 'auto', position: 'relative', display: 'block', maxWidth: '100%' }}>
        <Table aria-labelledby="tableTitle">
          <RequestTableHead order={order} orderBy={orderBy} />
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow hover role="checkbox" sx={{ '&:last-child td, &:last-child th': { border: 0 } }} tabIndex={-1} key={row.request_no}>
                  <TableCell component="th" id={labelId} scope="row">
                    <Link color="secondary">{row.request_no}</Link>
                  </TableCell>
                  <TableCell>{row.user_name}</TableCell>
                  <TableCell>{row.request_type}</TableCell>
                  <TableCell>
                    <Button variant="outlined" color="primary" size="small" href={row.pdf_link} target="_blank" rel="noopener noreferrer" startIcon={<PdfIcon />}>
                      Voir le PDF
                    </Button>
                    <Button variant="contained" color="primary" size="small" onClick={handlePrint} sx={{ marginLeft: 1 }} startIcon={<PrintIcon />}>
                      Imprimer
                    </Button>
                    <Button variant="contained" color="success" size="small" sx={{ marginLeft: 1 }}>
                      Valider
                    </Button>
                    <Button variant="contained" color="error" size="small" sx={{ marginLeft: 1 }}>
                      Rejeter
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

RequestTableHead.propTypes = { order: PropTypes.any, orderBy: PropTypes.string };
