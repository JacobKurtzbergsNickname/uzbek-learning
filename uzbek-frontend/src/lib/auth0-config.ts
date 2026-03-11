const PLACEHOLDER_PREFIXES = ["your-", "example", "changeme"];

function isMissing(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}

function isPlaceholder(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return PLACEHOLDER_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function getAuth0ConfigStatus() {
  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;
  const secret = process.env.AUTH0_SECRET;
  const appBaseUrl = process.env.APP_BASE_URL;

  const missing: string[] = [];

  if (isMissing(domain) || isPlaceholder(domain)) {
    missing.push("AUTH0_DOMAIN");
  }
  if (isMissing(clientId) || isPlaceholder(clientId)) {
    missing.push("AUTH0_CLIENT_ID");
  }
  if (isMissing(clientSecret) || isPlaceholder(clientSecret)) {
    missing.push("AUTH0_CLIENT_SECRET");
  }
  if (isMissing(secret) || isPlaceholder(secret)) {
    missing.push("AUTH0_SECRET");
  }
  if (isMissing(appBaseUrl)) {
    missing.push("APP_BASE_URL");
  }

  return {
    isConfigured: missing.length === 0,
    missing,
  };
}
