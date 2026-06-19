const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE = /\b(?:\+?\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/;

/** Find email/phone contact info in a string. */
export function findContactInfo(text: string): string[] {
  const hits: string[] = [];
  const email = text.match(EMAIL);
  if (email) hits.push(email[0]);
  const phone = text.match(PHONE);
  if (phone) hits.push(phone[0]);
  return hits;
}

/** Scan any value (serialized) for contact info. */
export function scanForContactInfo(value: unknown): string[] {
  return findContactInfo(JSON.stringify(value ?? ""));
}

/**
 * Enforce the no-scrape / no-contact-DB guardrail at the adapter boundary:
 * map_contacts and research_company surface roles/archetypes + public data
 * only, never harvested contact info.
 */
export function assertNoContactInfo(value: unknown, context: string): void {
  const hits = scanForContactInfo(value);
  if (hits.length > 0) {
    throw new Error(
      `Policy violation in ${context}: contact info present (${hits.join(", ")}). ` +
        "Envoy returns roles/archetypes and public data only — never harvested contacts.",
    );
  }
}
