// Default fallback to Render backend URL to prevent relative URL 404s if VITE_API_URL is missing
export const API_BASE = (
  import.meta.env.VITE_API_URL || 'https://securevault-backend-yswp.onrender.com'
).replace(/\/+$/, '');

/**
 * Executes API requests safely, checking Content-Type and HTTP status.
 * Prevents "Unexpected token 'T', 'The page c' ... is not valid JSON" errors.
 */
export const fetchApi = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    throw new Error('Unable to connect to backend server. Please check your internet connection.', {
      cause: err,
    });
  }

  const contentType = res.headers.get('content-type') || '';

  // If response is NOT JSON (e.g. Render spin-up delay or Vercel 404 HTML)
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (res.status === 404) {
      throw new Error('Backend API endpoint not found (404).');
    }
    if (res.status === 502 || res.status === 503 || text.includes('The page')) {
      throw new Error('Backend server is starting up on Render. Please wait a few seconds and try again.');
    }
    throw new Error(`Server returned non-JSON response (${res.status}).`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};