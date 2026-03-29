const configuredApiBaseUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = configuredApiBaseUrl || 'http://localhost:3001/api';
   
