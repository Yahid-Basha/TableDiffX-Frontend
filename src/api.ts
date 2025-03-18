import axios from 'axios';
import { DatabaseConnection, ComparisonOptions } from './types';

const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
  connect: async (connection: DatabaseConnection) => {
    const response = await axios.post(`${API_BASE_URL}/connect`, connection);
    return response.data;
  },

  getTables: async (dbName: string) => {
    const response = await axios.get(`${API_BASE_URL}/tables/${dbName}`);
    return response.data;
  },

  getColumns: async (tableName: string) => {
    const response = await axios.get(`${API_BASE_URL}/columns/${tableName}`);
    return response.data;
  },

  compare: async (options: ComparisonOptions) => {
    const response = await axios.post(`${API_BASE_URL}/compare`, options);
    return response.data;
  },
};