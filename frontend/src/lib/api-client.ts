let dynamicApiUrl = "";

async function getApiBaseUrl(): Promise<string> {
  if (dynamicApiUrl) return dynamicApiUrl;

  if (typeof window !== "undefined" && (window as any).electron && (window as any).electron.getEnv) {
    try {
      const env = await (window as any).electron.getEnv();
      if (env && env.PORT) {
        dynamicApiUrl = `http://127.0.0.1:${env.PORT}/api`;
        return dynamicApiUrl;
      }
    } catch (err) {
      console.warn("Failed to fetch env from electron:", err);
    }
  }

  dynamicApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
  return dynamicApiUrl;
}

interface FetchOptions extends RequestInit {
  data?: any;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export interface PaginationMeta {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export async function fetchClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { data, ...rest } = options;

  let token = "";
  if (typeof window !== "undefined") {
    try {
      const session = localStorage.getItem("optics_session");
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.token) {
          token = parsed.token;
        }
      }
    } catch (e) {
      console.warn("Failed to read token from localStorage");
    }
  }

  const defaultHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const restHeaders = rest.headers as any || {};
  let mergedHeaders: Record<string, string> = { ...defaultHeaders };

  if (typeof Headers !== "undefined" && restHeaders instanceof Headers) {
    restHeaders.forEach((value, key) => {
      mergedHeaders[key] = value;
    });
  } else if (Array.isArray(restHeaders)) {
    restHeaders.forEach(([key, value]) => {
      mergedHeaders[key] = value;
    });
  } else {
    mergedHeaders = { ...mergedHeaders, ...restHeaders };
  }

  const config: RequestInit = {
    ...rest,
    method: rest.method ? rest.method : (data ? "POST" : "GET"),
  };

  if (data) {
    if (data instanceof FormData) {
      delete mergedHeaders["Content-Type"];
      config.body = data;
    } else {
      mergedHeaders["Content-Type"] = "application/json";
      config.body = JSON.stringify(data);
    }
  }

  config.headers = mergedHeaders;

  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  console.log("[browser] FETCH URL:", url);
  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw error;
    }
    // Catch native fetch network errors (ERR_CONNECTION_REFUSED, offline, DNS failure)
    console.error("Network Error or Connection Refused:", error);
    throw new ApiError(
      0, 
      "Cannot connect to the server. Please check your internet connection or ensure the backend is running.", 
      { isOffline: true }
    );
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    
    // Auto-logout if unauthorized (e.g. token expired)
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("optics_session");
      // Prevent redirect loop if already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?expired=true";
      }
    }

    // License Required / Expired
    if (response.status === 402 && typeof window !== "undefined") {
      if (!window.location.pathname.includes("/activation")) {
        window.location.href = "/activation";
      }
    }

    throw new ApiError(response.status, errorData.message || "An API error occurred", errorData);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export async function downloadFile(endpoint: string, filename: string): Promise<void> {
  let token = "";
  if (typeof window !== "undefined") {
    try {
      const session = localStorage.getItem("optics_session");
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.token) {
          token = parsed.token;
        }
      }
    } catch (e) {
      console.warn("Failed to read token from localStorage");
    }
  }

  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  console.log("[browser] FETCH URL:", url);
  let response: Response;
  try {
    response = await fetch(url, { headers });
  } catch (error: any) {
    console.error("Network Error or Connection Refused during download:", error);
    throw new Error("Cannot connect to the server to download the file. Please check your connection.");
  }

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Builds a query string from a plain object, skipping undefined/null values.
 * e.g. { page: 1, search: "abc" } => "?page=1&search=abc"
 */
export function buildQueryString(params?: Record<string, any>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}
