import "server-only";
export function backendCredentialsReady() {
  return Boolean(
    process.env.API_USER &&
    process.env.API_KEY &&
    process.env.API_KEY.length >= 32,
  );
}
export function backendHeaders(): Record<string, string> {
  if (!backendCredentialsReady())
    throw new Error("Backend API credentials are not configured");
  return {
    Accept: "application/json",
    "X-API-User": process.env.API_USER!,
    "X-API-Key": process.env.API_KEY!,
  };
}
