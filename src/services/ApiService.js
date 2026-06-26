import axios from "axios";

// Base URL from environment variables
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Set Axios default timeout to 20 seconds
axios.defaults.timeout = 20000;

// Helper to handle API errors
const handleApiError = (error) => {
  console.error("API call error:", error);
  if (error.response) {
    console.error(`Error Status: ${error.response.status}`);
    console.error("Error Data:", error.response.data);
    
    // Log additional context for common status codes
    if (error.response.status === 401) {
      console.warn("Unauthorized API call. Session may have expired.");
    } else if (error.response.status === 403) {
      console.warn("Forbidden API call. Missing permissions.");
    } else if (error.response.status >= 500) {
      console.error("Internal Server Error occurred on the API backend.");
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error("No response received from API server:", error.request);
    // Enrich error message for user-facing components
    error.message = "No connection to server. Please check if the backend service is running or check your internet connection.";
  } else {
    // Something happened in setting up the request
    console.error("API Request setup failed:", error.message);
  }
  return Promise.reject(error);
};

// GET request
export const getRequest = async (endpoint) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
};

// POST request
export const postRequest = async (endpoint, data, isBlob = false) => {
  try {
    // Construct the config object for axios
    const config = isBlob ? { responseType: "blob" } : {};

    // Pass data as the second argument and config as the third argument
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, config);
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
};



// PUT request
export const putRequest = async (endpoint, data) => {
  try {
    const response = await axios.put(`${BASE_URL}${endpoint}`, data);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
};

// DELETE request
export const deleteRequest = async (endpoint) => {
  try {
    const response = await axios.delete(`${BASE_URL}${endpoint}`);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
};

