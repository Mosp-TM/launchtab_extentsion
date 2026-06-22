export function faviconUrl(origin: string): string {
  try {
    const hostname = new URL(origin).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=64`;
  }
}

export const isExtensionRuntime =
  typeof chrome !== "undefined" && Boolean(chrome.runtime?.id);
