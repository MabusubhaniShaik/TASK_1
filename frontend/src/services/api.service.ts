// src/services/api.service.ts
import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse, Method } from "axios";

// Define types
interface ApiRequestParams {
  url: string;
  method?: Method;
  payload?: Record<string, any> | FormData;
  query?: Record<string, any>;
  headers?: Record<string, string>;
  requireAuth?: boolean;
  timeout?: number;
}

interface ApiError {
  message: string;
  status?: number;
  data?: any;
  isNetworkError?: boolean;
}

// Base URL configuration
const getBaseURL = () => {
  // You can switch between different environments
  const env = "development";

  switch (env) {
    case "development":
    default:
      return "http://localhost:9009/";
  }
};

// Create axios instance with better configuration
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If it's FormData, remove Content-Type header to let browser set it
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.code === "ERR_NETWORK") {
      console.error("Network Error:", {
        message: "Cannot connect to server",
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });

      // You can trigger a global network error handler here
      if (typeof window !== "undefined") {
        // Show global network error notification
        const event = new CustomEvent("network-error", {
          detail: {
            message: "Cannot connect to server. Please check your connection.",
          },
        });
        window.dispatchEvent(event);
      }
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      // Redirect to login if not already there
      if (!window.location.pathname.includes("/signin")) {
        window.location.href = "/signin";
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Common Service to handle all CRUD operations
 * @returns Promise with response data
 */
export const apiService = async ({
  url,
  method = "GET",
  payload = {},
  query = {},
  headers = {},
  requireAuth = true,
  timeout = 30000,
}: ApiRequestParams): Promise<any> => {
  try {
    const config: AxiosRequestConfig = {
      url,
      method: method.toUpperCase() as Method,
      headers: {
        ...(requireAuth ? {} : {}), // Auth header added by interceptor
        ...headers,
      },
      params: query,
      data: payload,
      timeout,
    };

    console.log(`API Request: ${method} ${url}`, {
      query,
      payload: payload instanceof FormData ? "[FormData]" : payload,
    });

    const response: AxiosResponse = await axiosInstance(config);

    console.log(`API Response: ${response.status} ${url}`, response.data);

    return response.data;
  } catch (error: any) {
    console.error("API Request Error:", {
      url,
      method,
      error: error?.response?.data || error.message,
      status: error?.response?.status,
      code: error?.code,
    });

    // Create a structured error object
    const apiError: ApiError = {
      message:
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred",
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError:
        error.code === "ERR_NETWORK" || error.message === "Network Error",
    };

    // Throw the structured error
    throw apiError;
  }
};

// Convenience methods for CRUD operations
export const api = {
  // GET request
  get: (
    url: string,
    query?: Record<string, any>,
    headers?: Record<string, string>
  ) => apiService({ url, method: "GET", query, headers }),

  // POST request
  post: (
    url: string,
    payload?: Record<string, any>,
    query?: Record<string, any>,
    headers?: Record<string, string>
  ) => apiService({ url, method: "POST", payload, query, headers }),

  // PUT request
  put: (
    url: string,
    payload?: Record<string, any>,
    query?: Record<string, any>,
    headers?: Record<string, string>
  ) => apiService({ url, method: "PUT", payload, query, headers }),

  // PATCH request
  patch: (
    url: string,
    payload?: Record<string, any>,
    query?: Record<string, any>,
    headers?: Record<string, string>
  ) => apiService({ url, method: "PATCH", payload, query, headers }),

  // DELETE request
  delete: (
    url: string,
    query?: Record<string, any>,
    headers?: Record<string, string>
  ) => apiService({ url, method: "DELETE", query, headers }),

  // Upload file (with FormData)
  upload: (url: string, formData: FormData, headers?: Record<string, string>) =>
    apiService({
      url,
      method: "POST",
      payload: formData,
      headers: { ...headers, "Content-Type": "multipart/form-data" },
    }),

  // Set auth token manually if needed
  setAuthToken: (token: string) => {
    localStorage.setItem("access_token", token);
  },

  // Clear auth token
  clearAuthToken: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },
};
