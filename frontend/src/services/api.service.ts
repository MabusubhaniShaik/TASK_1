// Frontend API Service - No NestJS dependencies

export interface ApiRequestConfig {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  params?: Record<string, any>;
  payload?: Record<string, any> | any;
  headers?: Record<string, string>;
  timeout?: number;
}

export class ApiService {
  private baseURL: string =
    import.meta.env.VITE_BACKEND_ENDPOINT || "http://localhost:3000/api";

  /**
   * Execute API request with explicit method argument (RAW RESPONSE)
   */
  async executeRequest<T = any>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    payload?: Record<string, any> | any,
    params?: Record<string, any>,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    try {
      const fullURL = this.buildURL(url, params);

      // Create abort controller for timeout
      const abortController = new AbortController();
      const timeoutValue = timeout || 30000;
      const timeoutId = setTimeout(() => abortController.abort(), timeoutValue);

      const requestOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        credentials: "include",
        mode: "cors",
        signal: abortController.signal, // Use the controller's signal
      };

      if (method !== "GET" && payload) {
        requestOptions.body = JSON.stringify(payload);
      }

      console.log(" Making API request:", {
        method,
        url: fullURL,
        hasPayload: !!payload,
        headers: requestOptions.headers,
      });

      const response = await fetch(fullURL, requestOptions);
      clearTimeout(timeoutId); // Clear timeout if request completes

      console.log(" Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
      });

      // ✔ Return backend response AS-IS
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      console.error(" Request error:", error);

      // ✔ Throw raw error (no custom wrapper)
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.executeRequest<T>("GET", url, undefined, params, headers);
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    payload?: Record<string, any>,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.executeRequest<T>("POST", url, payload, params, headers);
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    payload?: Record<string, any>,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.executeRequest<T>("PUT", url, payload, params, headers);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    payload?: Record<string, any>,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.executeRequest<T>("PATCH", url, payload, params, headers);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.executeRequest<T>("DELETE", url, undefined, params, headers);
  }

  /**
   * Build full URL with query parameters
   */
  private buildURL(url: string, params?: Record<string, any>): string {
    const fullURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    if (!params) return fullURL;

    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => queryParams.append(key, item.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `${fullURL}?${queryString}` : fullURL;
  }

  /**
   * Handle response based on content type (RAW)
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      return (await response.json()) as T;
    } else if (contentType?.includes("text/")) {
      return (await response.text()) as T;
    } else {
      return (await response.blob()) as T;
    }
  }

  /**
   * Set base URL
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  /**
   * Get base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Export singleton
export const apiService = new ApiService();
