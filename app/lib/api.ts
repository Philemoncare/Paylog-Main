/**
 * ENTERPRISE-GRADE API FETCH UTILITY
 * Standardizes all outbound requests with timeout protection,
 * automatic JSON parsing, and graceful error normalization.
 */
export async function apiFetch(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  const fetchOptions: RequestInit = {
    ...options,
    cache: 'no-store', // Prevent stale data glitches in dashboards
    signal: controller.signal,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    }
  };

  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type") || "";

    // Safety check for non-JSON responses (e.g. server crashes returning HTML)
    if (!contentType.includes("application/json")) {
       const text = await response.text();
       if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
          throw new Error("Server error (HTML_FAULT). The API node might be restarting.");
       }
       return text;
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || data.message || `API Failure (${response.status})`);
      (error as any).status = response.status;
      (error as any).details = data.details;
      throw error;
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new Error("Synchronization Timeout: The platform node is responding slowly.");
    }

    // Log API faults in development
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[API_FAULT] ${url}:`, err.message);
    }

    throw err;
  }
}
