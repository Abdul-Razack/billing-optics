const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

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

export async function fetchClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { data, headers: customHeaders, ...rest } = options;

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
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const config: RequestInit = {
    method: data ? "POST" : "GET",
    headers,
    ...rest,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, config);

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
      window.location.href = "/login";
    }

    throw new ApiError(response.status, errorData.message || "An API error occurred", errorData);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
