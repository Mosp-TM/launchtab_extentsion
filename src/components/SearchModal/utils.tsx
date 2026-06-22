export const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function renderCompletionBold(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();

  if (lowerText.startsWith(lowerQuery)) {
    const prefix = text.slice(0, trimmed.length);
    const suffix = text.slice(trimmed.length);
    if (!suffix) return prefix;
    return (
      <>
        {prefix}
        <span className="font-semibold">{suffix}</span>
      </>
    );
  }

  let shared = 0;
  const max = Math.min(lowerText.length, lowerQuery.length);
  while (shared < max && lowerText[shared] === lowerQuery[shared]) {
    shared += 1;
  }

  const prefix = text.slice(0, shared);
  const suffix = text.slice(shared);
  if (!suffix) return prefix;

  return (
    <>
      {prefix}
      <span className="font-semibold">{suffix}</span>
    </>
  );
}

export function renderHighlightedMatch(
  text: string,
  searchText: string,
  highlightClassName = "font-semibold text-primary",
) {
  const trimmed = searchText.trim();
  if (!trimmed) return text;

  const matcher = new RegExp(`(${escapeRegExp(trimmed)})`, "ig");
  const parts = text.split(matcher);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.toLowerCase() !== trimmed.toLowerCase()) return part;
    return (
      <span key={`${part}-${i}`} className={highlightClassName}>
        {part}
      </span>
    );
  });
}

export function isUrl(input: string): boolean {
  if (input.startsWith("http://") || input.startsWith("https://")) return true;
  const urlPattern =
    /\.(com|org|net|io|dev|app|co|edu|gov|mil|int|biz|info|name|pro|aero|coop|museum|travel|jobs|mobi|asia|cat|tel|post|xxx|arpa|root|local|onion|bit|example|invalid|test|localhost)(\.[a-z]{2,})?(\/.*)?$/i;
  return urlPattern.test(input);
}
