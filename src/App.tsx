import React from 'react';
import {
  Container,
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Toaster, toast } from 'react-hot-toast';
import { Database } from 'lucide-react';
import DatabaseConnectionForm from './components/DatabaseConnectionForm';
import ComparisonForm from './components/ComparisonForm';
import ResultsTable from './components/ResultsTable';
import { api } from './api';
import type {
  DatabaseConnection,
  DatabaseContext,
  ComparisonOptions,
  ComparisonResult,
} from './types';

const steps = ['Connect Databases', 'Configure Comparison', 'View Results'];

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  const [activeStep, setActiveStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [sourceDb, setSourceDb] = React.useState<DatabaseContext>({
    connection: null,
    tables: [],
    selectedTable: '',
    columns: [],
  });
  const [targetDb, setTargetDb] = React.useState<DatabaseContext>({
    connection: null,
    tables: [],
    selectedTable: '',
    columns: [],
  });
  const [results, setResults] = React.useState<ComparisonResult[]>([]);

  const handleSourceConnect = async (connection: DatabaseConnection) => {
    try {
      setIsLoading(true);
      await api.connect(connection);
      const tables = await api.getTables(connection.databaseName);
      setSourceDb({
        connection,
        tables,
        selectedTable: '',
        columns: [],
      });
      toast.success('Successfully connected to source database!');
    } catch (error) {
      toast.error('Failed to connect to source database');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTargetConnect = async (connection: DatabaseConnection) => {
    try {
      setIsLoading(true);
      await api.connect(connection);
      const tables = await api.getTables(connection.databaseName);
      setTargetDb({
        connection,
        tables,
        selectedTable: '',
        columns: [],
      });
      toast.success('Successfully connected to target database!');
    } catch (error) {
      toast.error('Failed to connect to target database');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async (options: ComparisonOptions) => {
    try {
      setIsLoading(true);
      const results = await api.compare(options);
      setResults(results);
      setActiveStep(2);
      toast.success('Comparison completed!');
    } catch (error) {
      toast.error('Failed to compare tables');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    toast.success('Results exported successfully!');
  };

  const bothDatabasesConnected = sourceDb.connection && targetDb.connection;

  React.useEffect(() => {
    if (bothDatabasesConnected && activeStep === 0) {
      setActiveStep(1);
    }
  }, [bothDatabasesConnected]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      
      <Container maxWidth="lg">
        <Box py={4}>
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <Database size={40} />
            <Typography variant="h4" component="h1">
              Cross-Database Table Comparison
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {isLoading && (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          )}

          <Box display="grid" gap={4}>
            {activeStep === 0 && (
              <>
                <DatabaseConnectionForm
                  title="Source Database"
                  onConnect={handleSourceConnect}
                  isLoading={isLoading}
                  isConnected={!!sourceDb.connection}
                />
                <DatabaseConnectionForm
                  title="Target Database"
                  onConnect={handleTargetConnect}
                  isLoading={isLoading}
                  isConnected={!!targetDb.connection}
                />
              </>
            )}

            {activeStep === 1 && (
              <ComparisonForm
                sourceTables={sourceDb.tables}
                sourceColumns={sourceDb.columns}
                targetTables={targetDb.tables}
                targetColumns={targetDb.columns}
                onCompare={handleCompare}
                isLoading={isLoading}
              />
            )}

            {activeStep === 2 && results.length > 0 && (
              <ResultsTable results={results} onExport={handleExport} />
            )}
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;