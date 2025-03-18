import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Box,
  Button,
  Chip,
} from '@mui/material';
import { Download } from 'lucide-react';
import { ComparisonResult } from '../types';

interface Props {
  results: ComparisonResult[];
  onExport: () => void;
}

export default function ResultsTable({ results, onExport }: Props) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');

  const filteredResults = results.filter((result) =>
    Object.values(result.differences).some((diff) =>
      diff.sourceValue.toLowerCase().includes(search.toLowerCase()) ||
      diff.targetValue.toLowerCase().includes(search.toLowerCase())
    )
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched': return 'success';
      case 'mismatched': return 'error';
      case 'missing_source': return 'warning';
      case 'missing_target': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'matched': return 'Matched';
      case 'mismatched': return 'Mismatched';
      case 'missing_source': return 'Missing in Source';
      case 'missing_target': return 'Missing in Target';
      default: return status;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<Download size={20} />}
          onClick={onExport}
        >
          Export Results
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Differences</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredResults
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{result.id}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(result.status)}
                      color={getStatusColor(result.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {Object.entries(result.differences).map(([column, { sourceValue, targetValue }]) => (
                      <div key={column}>
                        <strong>{column}:</strong> {sourceValue} → {targetValue}
                      </div>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredResults.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Box>
  );
}