import type { ParsedStudent } from '@/types/draft';

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

/**
 * Turn a free-form paste into a list of recognised students.
 * Splits on whitespace, commas, and semicolons. Infers a display name
 * from the email's local part (e.g. "ada.nwosu" → "Ada Nwosu").
 */
export function parseEmailPaste(raw: string): ParsedStudent[] {
  if (!raw.trim()) return [];

  const parts = raw
    .split(/[\s,;]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Dedupe while preserving order.
  const seen = new Set<string>();
  const unique = parts.filter((p) => {
    const key = p.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.map((p) => {
    const valid = EMAIL_RE.test(p);
    if (!valid) {
      return { email: p, full_name: '', valid: false };
    }
    return { email: p, full_name: nameFromEmail(p), valid: true };
  });
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  return local
    .split(/[._\-+]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
