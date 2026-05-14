import { translateDescription } from './translate';

/**
 * Returns a copy of a `description` object with `displayName` derived
 * deterministically from `generated` via the structural-word dictionary.
 *
 * Used by the product create/edit API routes so the Spanish display name is
 * always kept in sync on write — the client cannot bypass it. Every existing
 * key is preserved; only `displayName` is added/updated. When `generated` is
 * missing or empty the input is returned untouched.
 */
export function withDisplayName<T extends { generated?: unknown } | null | undefined>(
  description: T,
): T {
  if (!description || typeof description.generated !== 'string' || !description.generated) {
    return description;
  }
  return { ...description, displayName: translateDescription(description.generated) };
}
