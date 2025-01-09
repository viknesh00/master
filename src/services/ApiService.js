import axios from "axios";

// Base URL from environment variables
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper to handle API errors
const handleApiError = (error) => {
  console.error("API call error:", error);
  if (error.response) {
    console.error(`Error Status: ${error.response.status}`);
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
