/**
 * Deterministic, dictionary-based translation of the structural words in a
 * generated product code description (English -> Spanish).
 *
 * Only known structural words are translated. Brand, model, year, version and
 * any unknown token are preserved exactly. The function is idempotent: every
 * Spanish output word is absent from the dictionary keys, so translating an
 * already-translated string is a no-op.
 *
 * Shared by the app read path, the backfill script and the tests so the
 * dictionary never drifts between them.
 */

/** English structural word -> Spanish display word. Keys MUST be uppercase. */
export const STRUCTURAL_DICTIONARY: Readonly<Record<string, string>> = {
  DOOR: 'PUERTA',
  FRONT: 'DELANTERA',
  REAR: 'TRASERA',
  LEFT: 'IZQUIERDA',
  RIGHT: 'DERECHA',
  BACK: 'MEDALLON',
  QUARTER: 'CUARTO',
  SIDE: 'LADO',
  WINDSHIELD: 'PARABRISAS',
  AND: 'Y',
};

/**
 * Translate the structural words of a generated description.
 *
 * Splitting keeps the original whitespace chunks so spacing and commas (e.g.
 * year lists like `2020, 2021`) are preserved exactly. Only whole tokens that
 * match a dictionary key are translated; substrings and partial matches are
 * left untouched.
 */
export function translateDescription(generated: string): string {
  if (!generated) return generated ?? '';

  return generated
    .split(/(\s+)/)
    .map((token) => {
      // Whitespace chunks (and empties from the split) pass through untouched.
      if (token === '' || /^\s+$/.test(token)) return token;
      // Only an exact, whole-token structural word is translated.
      return STRUCTURAL_DICTIONARY[token.toUpperCase()] ?? token;
    })
    .join('');
}
