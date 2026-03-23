// Mock client for environments where @metagptx/web-sdk is not available (e.g., Vercel)
const mockClient = {
  auth: {
    me: async () => ({ data: null }),
    toLogin: async () => {},
    logout: async () => {},
    login: async () => {},
  },
  entities: {
    dossiers: {
      create: async () => ({ data: null }),
      query: async () => ({ data: { items: [] } }),
      get: async () => ({ data: null }),
    },
  },
  storage: {
    upload: async () => ({ data: null }),
  },
} as any;

let client: any = mockClient;

// Try to dynamically import the SDK - will fail gracefully on Vercel
try {
  // Use a variable to prevent static analysis from resolving the import
  const sdkModule = "@metagptx/web-sdk";
  import(/* @vite-ignore */ sdkModule).then((mod) => {
    try {
      client = mod.createClient();
    } catch (e) {
      console.warn("Failed to initialize SDK client:", e);
    }
  }).catch(() => {
    console.warn("@metagptx/web-sdk not available, using mock client");
  });
} catch {
  console.warn("@metagptx/web-sdk not available, using mock client");
}

export { client };