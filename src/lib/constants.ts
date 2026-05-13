// src/lib/constants.ts
export const STORE = {
  name: 'Peerzada Medicate Duroo',
  address: 'Sopore, District Baramulla, Kashmir',
  licenseNo: 'Br-05-413/415',
  licenseLabel: 'Drug License No: Br-05-413/415',
  gstin: process.env.NEXT_PUBLIC_GSTIN || '01XXXXX0000X1ZX',
};

export const GST_RATES = [0, 5, 12, 18];

// API base URL - handles localhost and production
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}`;
  }
  return '';
};

// API fetch helper with proper URL handling
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
};
