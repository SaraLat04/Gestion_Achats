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

// project imports
import Dot from 'components/@extended/Dot';

function createData(request_no, user_name, request_type, status, submit_date) {
  return { request_no, user_name, request_type, status, submit_date };
}

const rows = [
  createData(84564564, 'John Doe', 'Achat Matériel', 0, '2025-03-12'),
  createData(98764564, 'Sara Smith', 'Requête Document', 1, '2025-03-13'),
  createData(98756325, 'Alex Johnson', 'Achat Logiciel', 2, '2025-03-14'),
  createData(98652366, 'Emily Davis', 'Formation', 0, '2025-03-15'),
  createData(13286564, 'Michael Brown', 'Achat Matériel', 1, '2025-03-16'),
  createData(86739658, 'Anna Wilson', 'Achat Matériel', 0, '2025-03-17'),
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
  {
    id: 'request_no',
    align: 'left',
    disablePadding: false,
    label: 'Numéro de demande'
  },
  {
    id: 'user_name',
    align: 'left',
    disablePadding: true,
    label: 'Nom de l\'utilisateur'
  },
  {
    id: 'request_type',
    align: 'left',
    disablePadding: false,
    label: 'Type de demande'
  },
  {
    id: 'status',
    align: 'left',
    disablePadding: false,
    label: 'Statut'
  },
  {
    id: 'submit_date',
    align: 'left',
    disablePadding: false,
    label: 'Date de soumission'
  }
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

// ==============================|| STATUT DES DEMANDES ||============================== //

function RequestStatus({ status }) {
  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
      {/* Un seul cercle sera coloré en fonction du statut */}
      <Dot
        color={status === 0 ? 'warning' : 'transparent'} // Si statut 0, couleur warning, sinon transparent
        borderColor={status === 0 ? 'warning' : 'transparent'} // Bordure colorée pour le statut 0
        variant={status === 0 ? 'filled' : 'outlined'} // Cercle plein pour statut 0
      />
      <Dot
        color={status === 1 ? 'success' : 'transparent'} // Si statut 1, couleur success, sinon transparent
        borderColor={status === 1 ? 'success' : 'transparent'} // Bordure colorée pour le statut 1
        variant={status === 1 ? 'filled' : 'outlined'} // Cercle plein pour statut 1
      />
      <Dot
        color={status === 2 ? 'error' : 'transparent'} // Si statut 2, couleur error, sinon transparent
        borderColor={status === 2 ? 'error' : 'transparent'} // Bordure colorée pour le statut 2
        variant={status === 2 ? 'filled' : 'outlined'} // Cercle plein pour statut 2
      />
    </Stack>
  );
}






// ==============================|| TABLEAU DE SUIVI DES DEMANDES ||============================== //

export default function RequestTable() {
  const order = 'asc';
  const orderBy = 'request_no';

  return (
    <Box>
      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          display: 'block',
          maxWidth: '100%',
          '& td, & th': { whiteSpace: 'nowrap' }
        }}
      >
        <Table aria-labelledby="tableTitle">
          <RequestTableHead order={order} orderBy={orderBy} />
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  hover
                  role="checkbox"
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  tabIndex={-1}
                  key={row.request_no}
                >
                  <TableCell component="th" id={labelId} scope="row">
                    <Link color="secondary">{row.request_no}</Link>
                  </TableCell>
                  <TableCell>{row.user_name}</TableCell>
                  <TableCell>{row.request_type}</TableCell>
                  <TableCell>
                    <RequestStatus status={row.status} />
                  </TableCell>
                  <TableCell>{row.submit_date}</TableCell>
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

RequestStatus.propTypes = { status: PropTypes.number };
