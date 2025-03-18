export interface DatabaseConnection {
  hostname: string;
  port: string;
  username: string;
  password: string;
  databaseType: string;
  databaseName: string;
}

export interface DatabaseContext {
  connection: DatabaseConnection | null;
  tables: string[];
  selectedTable: string;
  columns: string[];
}

export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
}

export interface ComparisonOptions {
  sourceTable: string;
  targetTable: string;
  columnMappings: ColumnMapping[];
  skipColumns: string[];
  matchingAlgorithm: 'exact' | 'fuzzy';
  fuzzyThreshold: number;
  exportFormat: 'json' | 'excel' | 'csv';
}

export interface ComparisonResult {
  id: number;
  status: 'matched' | 'mismatched' | 'missing_source' | 'missing_target';
  differences: Record<string, { sourceValue: string; targetValue: string }>;
}