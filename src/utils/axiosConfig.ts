import axios from "axios";

// Create a configurable Axios instance
const createAxiosInstance = (baseURL = "", headers = {}) => {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    timeout: 30000, // 30 seconds
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // You can modify the request config here
      // For example, add authentication token from storage
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      // You can modify the response here
      return response;
    },
    (error) => {
      // Handle errors globally
      return Promise.reject(error);
    }
  );

  return instance;
};

// Default instance with no base URL
const Axios = createAxiosInstance();

export default Axios;

// Export the factory function for custom instances
export { createAxiosInstance };
