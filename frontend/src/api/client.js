/**
 * Centralized API Client for Library Management System
 * Handles base routing, JSON encoding/decoding, headers, and console error diagnostics.
 */

const BASE_URL = '/api';

export async function apiClient(endpoint, { body, method, params, headers = {}, ...customConfig } = {}) {
  // Build query string if params are provided
  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  if (params) {
    const cleanParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams.append(key, value);
      }
    });
    const queryString = cleanParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('lms_auth_token') : null;
  const defaultHeaders = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...headers,
  };

  if (body) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    method: method || (body ? 'POST' : 'GET'),
    headers: defaultHeaders,
    ...customConfig,
  };

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    let responseData = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text ? { message: text } : null;
      }
    }

    if (!response.ok) {
      const errorMsg =
        responseData?.message ||
        responseData?.error ||
        `HTTP Error ${response.status}: ${response.statusText}`;

      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = responseData;

      console.error(`[API Error] ${config.method} ${url} (${response.status}):`, {
        status: response.status,
        statusText: response.statusText,
        payloadSent: body,
        errorResponse: responseData,
      });

      throw error;
    }

    return responseData;
  } catch (err) {
    if (!err.status) {
      // Network failure, proxy timeout, or server not reachable
      console.error(`[API Network/Connection Error] Failed to reach ${config.method} ${url}:`, err);
    }
    throw err;
  }
}
