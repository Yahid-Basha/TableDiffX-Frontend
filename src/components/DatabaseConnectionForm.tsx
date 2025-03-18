import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Box,
  Chip,
} from '@mui/material';
import { Check, X } from 'lucide-react';
import { DatabaseConnection } from '../types';

interface Props {
  title: string;
  onConnect: (connection: DatabaseConnection) => void;
  isLoading: boolean;
  isConnected: boolean;
}

export default function DatabaseConnectionForm({ title, onConnect, isLoading, isConnected }: Props) {
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
      <CardHeader
        title={title}
        action={
          isConnected ? (
            <Chip
              icon={<Check size={16} />}
              label="Connected"
              color="success"
              variant="outlined"
            />
          ) : (
            <Chip
              icon={<X size={16} />}
              label="Not Connected"
              color="error"
              variant="outlined"
            />
          )
        }
      />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Box display="grid" gap={3} gridTemplateColumns="repeat(2, 1fr)">
            <TextField
              label="Hostname"
              value={formData.hostname}
              onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
              required
              fullWidth
              disabled={isConnected}
            />
            <TextField
              label="Port"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              required
              fullWidth
              disabled={isConnected}
            />
            <TextField
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              fullWidth
              disabled={isConnected}
            />
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              fullWidth
              disabled={isConnected}
            />
            <FormControl fullWidth>
              <InputLabel>Database Type</InputLabel>
              <Select
                value={formData.databaseType}
                onChange={(e) => setFormData({ ...formData, databaseType: e.target.value })}
                label="Database Type"
                disabled={isConnected}
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
              disabled={isConnected}
            />
          </Box>
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            {isConnected && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setFormData({
                  hostname: '',
                  port: '',
                  username: '',
                  password: '',
                  databaseType: 'mysql',
                  databaseName: '',
                })}
              >
                Disconnect
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || isConnected}
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}