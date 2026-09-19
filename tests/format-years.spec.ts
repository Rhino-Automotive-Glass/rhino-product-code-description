import { test, expect } from '@playwright/test';
import { formatYears } from '../app/lib/description/formatYears';

test.describe('formatYears', () => {
  test('collapses consecutive years into a range', () => {
    expect(formatYears(['2020', '2021', '2022'])).toBe('2020-2022');
  });

  test('splits the range at a gap instead of implying the missing year', () => {
    expect(formatYears(['2020', '2021', '2023'])).toBe('2020-2021, 2023');
  });

  test('lists isolated years individually', () => {
    expect(formatYears(['2018', '2020', '2022'])).toBe('2018, 2020, 2022');
  });

  test('keeps a single year as is', () => {
    expect(formatYears(['2023'])).toBe('2023');
  });

  test('ignores input order and duplicates', () => {
    expect(formatYears(['2022', '2020', '2021', '2020'])).toBe('2020-2022');
  });

  test('keeps non-year values after the years', () => {
    expect(formatYears(['2021', 'ALL', '2020'])).toBe('2020-2021, ALL');
  });
});
