import axios from "axios";

// Base URL from environment variables
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Set Axios default timeout to 20 seconds
axios.defaults.timeout = 20000;

/* -------------------------------------------------------------------------- *
 * Standard API envelope
 *
 * Every endpoint now answers with the same shape, for success and failure:
 *
 *   { success, statusCode, message, data, errors, traceId, timestamp }
 *
 * Components read the payload as `response.data` and show errors with
 * `error.response.data`, so the envelope is unwrapped here - once - instead of
 * at each of the call sites. From a component's point of view nothing changed:
 *
 *   res.data              -> the payload, exactly as before
 *   error.response.data   -> a readable message string, exactly as before
 *
 * What is new and available when a component wants it:
 *
 *   res.apiResponse       -> the whole envelope
 *   res.message           -> the server's success message
 *   error.apiMessage      -> the readable message
 *   error.apiErrors       -> array of field-level validation messages
 *   error.traceId         -> correlation id, worth quoting in a bug report
 * -------------------------------------------------------------------------- */

export const CORRELATION_HEADER = "X-Correlation-ID";

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

const isApiEnvelope = (body) =>
  !!body &&
  typeof body === "object" &&
  !Array.isArray(body) &&
  typeof body.success === "boolean" &&
  typeof body.statusCode === "number" &&
  "data" in body &&
  "traceId" in body;

const toErrorList = (envelope) =>
  Array.isArray(envelope?.errors) ? envelope.errors.filter(Boolean) : [];

// Collapses an envelope into the single line a toast can display. Field-level
// validation messages are self-describing, so they win over the generic
// "Validation failed." headline when both are present.
const readableMessage = (envelope, fallback = DEFAULT_ERROR_MESSAGE) => {
  const errors = toErrorList(envelope);
  if (errors.length > 0) return errors.join("\n");
  return envelope?.message || fallback;
};

/** Best available message for any rejected request, envelope or not. */
export const getApiErrorMessage = (error, fallback = DEFAULT_ERROR_MESSAGE) => {
  if (error?.apiMessage) return error.apiMessage;

  const body = error?.response?.data;
  if (isApiEnvelope(body)) return readableMessage(body, fallback);
  if (typeof body === "string" && body.trim()) return body;

  return error?.message || fallback;
};

/** Field-level validation messages the API sent, or an empty array. */
export const getApiErrors = (error) => error?.apiErrors ?? [];

/** Correlation id of the failed request, for support and log lookups. */
export const getApiTraceId = (error) =>
  error?.traceId ??
  error?.response?.headers?.[CORRELATION_HEADER.toLowerCase()] ??
  null;

/* -------------------------------------------------------------------------- *
 * Interceptors
 * -------------------------------------------------------------------------- */

// Helper to handle API errors
const handleApiError = (error) => {
  const envelope = isApiEnvelope(error?.response?.data)
    ? error.response.data
    : null;

  if (envelope) {
    error.apiResponse = envelope;
    error.apiErrors = toErrorList(envelope);
    error.traceId = envelope.traceId;
    error.apiMessage = readableMessage(envelope);

    // Components historically passed `error.response.data` straight into a
    // toast, where it was a plain string. Preserve that contract - the full
    // envelope stays reachable on `error.apiResponse`.
    error.response.data = error.apiMessage;
    error.message = error.apiMessage;
  }

  if (error.response) {
    const method = error.config?.method?.toUpperCase() ?? "";
    const url = error.config?.url ?? "";

    console.error(`API ${error.response.status} ${method} ${url}`, {
      message: getApiErrorMessage(error),
      errors: getApiErrors(error),
      traceId: getApiTraceId(error),
    });

    // Log additional context for common status codes
    if (error.response.status === 401) {
      console.warn("Unauthorized API call. Credentials were rejected.");
    } else if (error.response.status === 403) {
      console.warn("Forbidden API call. Missing permissions or inactive account.");
    } else if (error.response.status === 409) {
      console.warn("Conflict. The record already exists or was changed by someone else.");
    } else if (error.response.status === 422) {
      console.warn("Business rule rejected the request.");
    } else if (error.response.status >= 500) {
      console.error("Internal Server Error occurred on the API backend.");
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error("No response received from API server:", error.request);
    // Enrich error message for user-facing components
    error.message =
      "No connection to server. Please check if the backend service is running or check your internet connection.";
  } else {
    // Something happened in setting up the request
    console.error("API Request setup failed:", error.message);
  }

  return Promise.reject(error);
};

// Success: replace the envelope with its payload so existing components that
// read `response.data` keep working untouched. Blob downloads carry a Blob
// rather than an envelope, so they pass through unchanged.
axios.interceptors.response.use((response) => {
  const body = response.data;

  if (isApiEnvelope(body)) {
    response.apiResponse = body;
    response.message = body.message;
    response.traceId = body.traceId;
    response.data = body.data;
  }

  return response;
}, handleApiError);

/* -------------------------------------------------------------------------- *
 * Requests
 * -------------------------------------------------------------------------- */

// GET request
export const getRequest = async (endpoint) => {
  const response = await axios.get(`${BASE_URL}${endpoint}`);
  return response;
};

// POST request
export const postRequest = async (endpoint, data, isBlob = false) => {
  // Construct the config object for axios
  const config = isBlob ? { responseType: "blob" } : {};

  // Pass data as the second argument and config as the third argument
  const response = await axios.post(`${BASE_URL}${endpoint}`, data, config);

  return response;
};

// PUT request
export const putRequest = async (endpoint, data) => {
  const response = await axios.put(`${BASE_URL}${endpoint}`, data);
  return response;
};

// DELETE request
export const deleteRequest = async (endpoint) => {
  const response = await axios.delete(`${BASE_URL}${endpoint}`);
  return response;
};
