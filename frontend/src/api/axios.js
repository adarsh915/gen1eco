import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,  // ✅ your Express backend port
  withCredentials: true,
});

// Request Interceptor for logging (development only)
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(`🚀 [${timestamp}] API Request: ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log(`📤 Request Data:`, JSON.stringify(config.data, null, 2));
      }
      if (config.params) {
        console.log(`🔍 Query Params:`, config.params);
      }
    }
    // Add request start time for timing
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response Interceptor for logging (development only)
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`✅ [${timestamp}] API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
      if (response.data) {
        console.log(`📥 Response Data:`, JSON.stringify(response.data, null, 2));
      }
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      if (error.response) {
        // Server responded with error status
        const duration = Date.now() - (error.config?.metadata?.startTime || Date.now());
        console.error(`❌ [${timestamp}] API Error Response: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`);
        if (error.response.data) {
          console.error(`📥 Error Response Data:`, JSON.stringify(error.response.data, null, 2));
        }
      } else if (error.request) {
        // Network error
        console.error(`🔌 [${timestamp}] Network Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
        console.error('No response received:', error.message);
      } else {
        // Other error
        console.error(`⚠️ [${timestamp}] Request Setup Error:`, error.message);
      }
    }
    return Promise.reject(error);
  }
);

export default api;