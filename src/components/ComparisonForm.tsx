import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { ComparisonOptions, ColumnMapping } from '../types';
import ColumnMappingForm from './ColumnMappingForm';

interface Props {
  sourceTables: string[];
  sourceColumns: string[];
  targetTables: string[];
  targetColumns: string[];
  onCompare: (options: ComparisonOptions) => void;
  isLoading: boolean;
}

export default function ComparisonForm({
  sourceTables,
  sourceColumns,
  targetTables,
  targetColumns,
  onCompare,
  isLoading,
}: Props) {
  const [options, setOptions] = React.useState<ComparisonOptions>({
    sourceTable: '',
    targetTable: '',
    columnMappings: [],
    skipColumns: [],
    matchingAlgorithm: 'exact',
    fuzzyThreshold: 80,
    exportFormat: 'json',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCompare(options);
  };

  return (
    <Card elevation={3}>
      <CardHeader title="Comparison Configuration" />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Box display="grid" gap={3}>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3}>
              <FormControl fullWidth>
                <InputLabel>Source Table</InputLabel>
                <Select
                  value={options.sourceTable}
                  onChange={(e) => setOptions({ ...options, sourceTable: e.target.value as string })}
                  label="Source Table"
                >
                  {sourceTables.map((table) => (
                    <MenuItem key={table} value={table}>{table}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Target Table</InputLabel>
                <Select
                  value={options.targetTable}
                  onChange={(e) => setOptions({ ...options, targetTable: e.target.value as string })}
                  label="Target Table"
                >
                  {targetTables.map((table) => (
                    <MenuItem key={table} value={table}>{table}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <ColumnMappingForm
              sourceColumns={sourceColumns}
              targetColumns={targetColumns}
              mappings={options.columnMappings}
              onMappingsChange={(mappings) => setOptions({ ...options, columnMappings: mappings })}
            />

            <FormControl fullWidth>
              <InputLabel>Matching Algorithm</InputLabel>
              <Select
                value={options.matchingAlgorithm}
                onChange={(e) => setOptions({ ...options, matchingAlgorithm: e.target.value as 'exact' | 'fuzzy' })}
                label="Matching Algorithm"
              >
                <MenuItem value="exact">Exact Match</MenuItem>
                <MenuItem value="fuzzy">Fuzzy Match</MenuItem>
              </Select>
            </FormControl>

            {options.matchingAlgorithm === 'fuzzy' && (
              <Box>
                <Typography>Fuzzy Match Threshold: {options.fuzzyThreshold}%</Typography>
                <Slider
                  value={options.fuzzyThreshold}
                  onChange={(_, value) => setOptions({ ...options, fuzzyThreshold: value as number })}
                  min={0}
                  max={100}
                  step={1}
                />
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={options.exportFormat}
                onChange={(e) => setOptions({ ...options, exportFormat: e.target.value as 'json' | 'excel' | 'csv' })}
                label="Export Format"
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Comparing...' : 'Compare Tables'}
              </Button>
            </Box>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}