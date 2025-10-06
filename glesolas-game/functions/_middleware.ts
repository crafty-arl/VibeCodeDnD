/**
 * Middleware configuration for Cloudflare Pages Functions
 * Enables Node.js compatibility for packages like craiyon
 */

export const onRequest: PagesFunction = async (context) => {
  return context.next();
};

// Export compatibility flags
export const config = {
  compatibility_flags: ['nodejs_compat'],
};
