import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';
import { ColumnMapping } from '../types';

interface Props {
  sourceColumns: string[];
  targetColumns: string[];
  mappings: ColumnMapping[];
  onMappingsChange: (mappings: ColumnMapping[]) => void;
}

export default function ColumnMappingForm({
  sourceColumns,
  targetColumns,
  mappings,
  onMappingsChange,
}: Props) {
  const handleAddMapping = () => {
    onMappingsChange([
      ...mappings,
      { sourceColumn: sourceColumns[0], targetColumn: targetColumns[0] },
    ]);
  };

  const handleRemoveMapping = (index: number) => {
    const newMappings = mappings.filter((_, i) => i !== index);
    onMappingsChange(newMappings);
  };

  const handleMappingChange = (index: number, field: keyof ColumnMapping, value: string) => {
    const newMappings = mappings.map((mapping, i) =>
      i === index ? { ...mapping, [field]: value } : mapping
    );
    onMappingsChange(newMappings);
  };

  return (
    <Card elevation={3}>
      <CardHeader
        title="Column Mapping"
        action={
          <Button
            startIcon={<Plus size={20} />}
            onClick={handleAddMapping}
            variant="outlined"
          >
            Add Mapping
          </Button>
        }
      />
      <CardContent>
        <Box display="grid" gap={3}>
          {mappings.map((mapping, index) => (
            <Box
              key={index}
              display="grid"
              gridTemplateColumns="1fr 1fr auto"
              gap={2}
              alignItems="center"
            >
              <FormControl fullWidth>
                <InputLabel>Source Column</InputLabel>
                <Select
                  value={mapping.sourceColumn}
                  onChange={(e) => handleMappingChange(index, 'sourceColumn', e.target.value)}
                  label="Source Column"
                >
                  {sourceColumns.map((column) => (
                    <MenuItem key={column} value={column}>{column}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Target Column</InputLabel>
                <Select
                  value={mapping.targetColumn}
                  onChange={(e) => handleMappingChange(index, 'targetColumn', e.target.value)}
                  label="Target Column"
                >
                  {targetColumns.map((column) => (
                    <MenuItem key={column} value={column}>{column}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton
                color="error"
                onClick={() => handleRemoveMapping(index)}
              >
                <Trash2 size={20} />
              </IconButton>
            </Box>
          ))}
          {mappings.length === 0 && (
            <Typography color="text.secondary" textAlign="center">
              No column mappings defined. Click "Add Mapping" to start mapping columns.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}