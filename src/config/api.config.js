// Strip trailing slash if provided in environment variable
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/**
 * Helper to execute API fetches with robust content-type checking and error handling.
 * Prevents "Unexpected token 'T', 'The page c' ... is not valid JSON" crashes
 * when backend returns HTML error pages (e.g. Render spin-up delays or 404s).
 */
export const fetchApi = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  let res;
  try {
    res = await fetch(url, options);
  } catch (netErr) {
    throw new Error(`Network error: Unable to reach the server. Please check your internet connection. ${netErr}`);
  }

  const contentType = res.headers.get('content-type') || '';
  
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (res.status === 404) {
      throw new Error('Requested API endpoint was not found (404).');
    }
    if (text.includes('The page') || res.status === 502 || res.status === 503) {
      throw new Error('Backend server is spinning up or temporarily unavailable. Please try again in a few seconds.');
    }
    throw new Error(`Server returned unexpected response (${res.status}): ${text.slice(0, 100)}`);
  }

  const data = await res.json();
  if (!res.ok && data.message) {
    throw new Error(data.message);
  }
  return data;
};
