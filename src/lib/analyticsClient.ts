export type VisitPayload = {
  tabId?: string;
  title?: string;
  url?: string;
  source?: string;
};

export const trackVisit = (_payload: VisitPayload) => {};

export const trackSearch = (_query: string, _searchEngine: string) => {};
