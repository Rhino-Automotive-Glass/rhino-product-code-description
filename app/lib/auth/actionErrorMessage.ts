/**
 * Turns an error thrown while calling a server action into a message for the
 * auth forms.
 *
 * Server action IDs change with every build. A page loaded before a deploy
 * still sends the old ID, and the new server rejects it with
 *   Server Action "…" was not found on the server. Read more: …
 * That is not something the user did wrong, and reloading fixes it, so say so
 * instead of showing Next.js's internal text.
 */
export const STALE_PAGE_MESSAGE = 'The app was just updated. Please reload the page and try again.';

const STALE_ACTION = /Server Action .* was not found on the server|failed-to-find-server-action/i;

export function actionErrorMessage(error: unknown, prefix: string): string {
  const message = error instanceof Error ? error.message : 'Unknown error';
  if (STALE_ACTION.test(message)) return STALE_PAGE_MESSAGE;
  return `${prefix} ${message}`;
}
