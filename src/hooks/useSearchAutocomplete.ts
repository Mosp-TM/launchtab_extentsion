"use client";

import { useEffect, useState } from "react";
import type { SearchEngine } from "@/store/settingsStore";

async function fetchGoogleSuggestions(
  query: string,
  signal: AbortSignal,
): Promise<string[]> {
  const response = await fetch(
    `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`,
    { signal },
  );
  const text = await response.text();
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  const parsed = JSON.parse(match[0]) as [string, string[]];
  return Array.isArray(parsed[1]) ? parsed[1] : [];
}

async function fetchDuckDuckGoSuggestions(
  query: string,
  signal: AbortSignal,
): Promise<string[]> {
  const response = await fetch(
    `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`,
    { signal },
  );
  const data = (await response.json()) as Array<{ phrase: string }>;
  return data.map((item) => item.phrase).filter(Boolean);
}

async function fetchBingSuggestions(
  query: string,
  signal: AbortSignal,
): Promise<string[]> {
  const response = await fetch(
    `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(query)}`,
    { signal },
  );
  const text = await response.text();
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  const parsed = JSON.parse(match[0]) as [string, string[]];
  return Array.isArray(parsed[1]) ? parsed[1] : [];
}

async function fetchBraveSuggestions(
  query: string,
  signal: AbortSignal,
): Promise<string[]> {
  const response = await fetch(
    `https://search.brave.com/api/suggest?q=${encodeURIComponent(query)}`,
    { signal },
  );
  const data = (await response.json()) as {
    results?: Array<{ query: string }>;
  };
  return (data.results ?? []).map((item) => item.query).filter(Boolean);
}

async function fetchSuggestions(
  query: string,
  searchEngine: SearchEngine,
  signal: AbortSignal,
): Promise<string[]> {
  switch (searchEngine) {
    case "duckduckgo":
      return fetchDuckDuckGoSuggestions(query, signal);
    case "bing":
      return fetchBingSuggestions(query, signal);
    case "brave":
      return fetchBraveSuggestions(query, signal);
    default:
      return fetchGoogleSuggestions(query, signal);
  }
}

export function useSearchAutocomplete(
  query: string,
  searchEngine: SearchEngine,
) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      fetchSuggestions(trimmed, searchEngine, controller.signal)
        .then(setSuggestions)
        .catch(() => {
          if (!controller.signal.aborted) {
            setSuggestions([]);
          }
        });
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, searchEngine]);

  return suggestions;
}
