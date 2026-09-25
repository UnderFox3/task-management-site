// Augment the CloudflareEnv interface from @opennextjs/cloudflare
// to include our project-specific D1 binding defined in wrangler.jsonc.
declare global {
  interface CloudflareEnv {
    DB: D1Database;
  }
}

export {};
