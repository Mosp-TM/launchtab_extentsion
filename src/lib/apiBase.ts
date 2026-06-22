const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export function apiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalized}` : normalized;
}

export function faviconUrl(origin: string): string {
  if (API_BASE) {
    return apiUrl(
      `/api/proxy-favicon?url=${encodeURIComponent(origin)}`,
    );
  }

  try {
    const hostname = new URL(origin).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=64`;
  }
}

export const isExtensionRuntime =
  typeof chrome !== "undefined" && Boolean(chrome.runtime?.id);
