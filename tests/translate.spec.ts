import { test, expect } from '@playwright/test';
import {
  translateDescription,
  STRUCTURAL_DICTIONARY,
} from '../app/lib/description/translate';

test.describe('translateDescription', () => {
  test('translates the spec example end to end', () => {
    expect(
      translateDescription('DOOR FRONT LEFT PEUGEOT PARTNER 2019 PEUGEOT RIFTER 2019'),
    ).toBe('PUERTA DELANTERA IZQUIERDA PEUGEOT PARTNER 2019 PEUGEOT RIFTER 2019');
  });

  test('translates every structural word in the dictionary', () => {
    for (const [en, es] of Object.entries(STRUCTURAL_DICTIONARY)) {
      expect(translateDescription(en)).toBe(es);
    }
  });

  test('preserves brand, model, year, version and unknown tokens exactly', () => {
    expect(translateDescription('QUARTER REAR RIGHT TOYOTA HILUX 2021 SR5')).toBe(
      'CUARTO TRASERA DERECHA TOYOTA HILUX 2021 SR5',
    );
  });

  test('translates SIDE to LADO', () => {
    expect(translateDescription('SIDE FRONT LEFT TOYOTA CAMRY 2020')).toBe(
      'LADO DELANTERA IZQUIERDA TOYOTA CAMRY 2020',
    );
  });

  test('translates AND to Y (both-sides descriptions)', () => {
    expect(translateDescription('DOOR FRONT LEFT AND RIGHT TOYOTA CAMRY 2020')).toBe(
      'PUERTA DELANTERA IZQUIERDA Y DERECHA TOYOTA CAMRY 2020',
    );
  });

  test('preserves commas and year lists', () => {
    expect(
      translateDescription('DOOR FRONT LEFT TOYOTA CAMRY 2020, 2021, 2022'),
    ).toBe('PUERTA DELANTERA IZQUIERDA TOYOTA CAMRY 2020, 2021, 2022');
  });

  test('only translates whole tokens, never substrings', () => {
    // "DOORSTOP" / "BACKREST" contain dictionary keys but are not whole matches.
    expect(translateDescription('DOORSTOP BACKREST')).toBe('DOORSTOP BACKREST');
  });

  test('is idempotent — re-running produces the same result', () => {
    const once = translateDescription('BACK QUARTER WINDSHIELD HONDA CIVIC 2018');
    const twice = translateDescription(once);
    expect(once).toBe('MEDALLON CUARTO PARABRISAS HONDA CIVIC 2018');
    expect(twice).toBe(once);
  });

  test('handles an empty string', () => {
    expect(translateDescription('')).toBe('');
  });
});
