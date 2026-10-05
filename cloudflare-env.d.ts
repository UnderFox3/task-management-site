// Augment the CloudflareEnv interface from @opennextjs/cloudflare
// to include our project-specific D1 binding defined in wrangler.jsonc.
declare global {
  interface CloudflareEnv {
    DB: D1Database;
    RESEND_API_KEY?: string;
    RESEND_FROM_EMAIL?: string;
    APP_URL?: string;
    ENABLE_LOCAL_DEMO_SEED?: string;
  }
}

export {};
