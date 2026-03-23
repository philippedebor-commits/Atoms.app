// Runtime configuration
let runtimeConfig: {
  API_BASE_URL: string;
} | null = null;

// Default fallback configuration
const defaultConfig = {
  API_BASE_URL: 'http://127.0.0.1:8000', // Only used if runtime config fails to load
};

// Function to load runtime configuration (non-blocking with timeout)
export async function loadRuntimeConfig(): Promise<void> {
  try {
    // Use AbortController with a 3-second timeout so it never hangs
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('/api/config', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        runtimeConfig = await response.json();
        console.log('Runtime config loaded successfully');
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('Config fetch timed out after 3s, using defaults');
    } else {
      console.log('Failed to load runtime config, using defaults:', error);
    }
  }
}

// Get current configuration
export function getConfig() {
  // First try runtime config (for Lambda)
  if (runtimeConfig) {
    return runtimeConfig;
  }

  // Then try Vite environment variables (for local development)
  if (import.meta.env.VITE_API_BASE_URL) {
    return {
      API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    };
  }

  // Finally fall back to default
  return defaultConfig;
}

// Dynamic API_BASE_URL getter
export function getAPIBaseURL(): string {
  return getConfig().API_BASE_URL;
}

export const config = {
  get API_BASE_URL() {
    return getAPIBaseURL();
  },
};