const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value || value.length > 2048 || /[\u0000-\u0020\u007f\\]/.test(value))
    return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function configuredApiUrl(value: string | undefined): string {
  const safe = safeHttpUrl(value);
  if (!safe) return "";
  const url = new URL(safe);
  if (
    url.search ||
    url.hash ||
    /\/api\/v1\/?$/.test(url.pathname) ||
    (url.protocol === "http:" && !localHosts.has(url.hostname))
  )
    return "";
  return url.href.replace(/\/$/, "");
}

export function exactImageHosts(value: string | undefined): string[] {
  const hosts = (value || "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  if (
    hosts.some(
      (host) =>
        !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(
          host,
        ) || host.length > 253,
    )
  )
    throw new Error(
      "IMAGE_REMOTE_HOSTS must contain exact hostnames without wildcards, ports, credentials, or paths.",
    );
  return [...new Set(hosts)];
}

export function articleUrl(value: string, origin?: string, fragment = false) {
  if (!value || /[\u0000-\u0020\u007f\\]/.test(value) || value.length > 2048)
    return null;
  if (fragment && value.startsWith("#")) return value;
  if (value.startsWith("/") && !value.startsWith("//"))
    return origin ? safeHttpUrl(new URL(value, origin).href) : value;
  return safeHttpUrl(value);
}
