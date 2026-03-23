import { createClient } from "@metagptx/web-sdk";

let client: ReturnType<typeof createClient>;

try {
  client = createClient();
} catch (e) {
  console.warn("Failed to initialize SDK client:", e);
  // Create a minimal mock client so the app doesn't crash
  client = {
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
}

export { client };