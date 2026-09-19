/**
 * Formats a model's compatible years for the generated product description.
 *
 * Consecutive years collapse into a range; a gap starts a new entry, so the
 * description never claims a year the part does not fit:
 *
 *   2020, 2021, 2022  -> "2020-2022"
 *   2020, 2021, 2023  -> "2020-2021, 2023"
 *   2018, 2020, 2022  -> "2018, 2020, 2022"
 *
 * Input order and duplicates do not matter. Values that are not plain years
 * are kept as-is after the numeric ones, in their original order.
 *
 * Shared by the Agregar form and the edit modal so both describe a product
 * identically.
 */
export function formatYears(years: readonly string[]): string {
  const unique = [...new Set(years.map((y) => y.trim()).filter(Boolean))];

  const numeric = unique
    .filter((y) => /^\d{4}$/.test(y))
    .map(Number)
    .sort((a, b) => a - b);
  const other = unique.filter((y) => !/^\d{4}$/.test(y));

  const runs: string[] = [];
  let start = numeric[0];
  let prev = numeric[0];

  for (let i = 1; i <= numeric.length; i++) {
    const year = numeric[i];
    if (year === prev + 1) {
      prev = year;
      continue;
    }
    runs.push(start === prev ? String(start) : `${start}-${prev}`);
    start = year;
    prev = year;
  }

  return [...runs, ...other].join(', ');
}
