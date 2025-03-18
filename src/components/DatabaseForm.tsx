import React from 'react';
import {
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import { DatabaseConnection } from '../types';

interface Props {
  onConnect: (connection: DatabaseConnection) => void;
  isLoading: boolean;
}

export default function DatabaseForm({ onConnect, isLoading }: Props) {
  const [formData, setFormData] = React.useState<DatabaseConnection>({
    hostname: '',
    port: '',
    username: '',
    password: '',
    databaseType: 'mysql',
    databaseName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(formData);
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Box display="grid" gap={3} gridTemplateColumns="repeat(2, 1fr)">
            <TextField
              label="Hostname"
              value={formData.hostname}
              onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Port"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Database Type</InputLabel>
              <Select
                value={formData.databaseType}
                onChange={(e) => setFormData({ ...formData, databaseType: e.target.value })}
                label="Database Type"
              >
                <MenuItem value="mysql">MySQL</MenuItem>
                <MenuItem value="postgresql">PostgreSQL</MenuItem>
                <MenuItem value="sqlserver">SQL Server</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Database Name"
              value={formData.databaseName}
              onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
              required
              fullWidth
            />
          </Box>
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}