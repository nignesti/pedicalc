import { describe, it, expect } from 'vitest';
import { calculate, CalculationError } from '../calculator';
import type { DosageRule } from '../../types/drug';

describe('calculator - validazione input', () => {
  const rule: DosageRule = {
    kind: 'weight-based',
    factor: 0.1,
    unit: 'mg',
    route: 'EV',
  };

  it('rifiuta peso zero', () => {
    expect(() => calculate(rule, { weightKg: 0 })).toThrow(CalculationError);
  });

  it('rifiuta peso negativo', () => {
    expect(() => calculate(rule, { weightKg: -5 })).toThrow(CalculationError);
  });

  it('rifiuta peso NaN', () => {
    expect(() => calculate(rule, { weightKg: NaN })).toThrow(CalculationError);
  });
});

describe('calculator - weight-based', () => {
  it('calcola dose lineare senza limiti (Morfina 0.1 mg/kg × 20 kg = 2.00 mg)', () => {
    const rule: DosageRule = {
      kind: 'weight-based',
      factor: 0.1,
      unit: 'mg',
      route: 'EV',
    };
    const result = calculate(rule, { weightKg: 20 });
    expect(result.entries[0].value).toBe('2.00');
    expect(result.entries[0].unit).toBe('mg');
    expect(result.entries[0].route).toBe('EV');
    expect(result.entries[0].note).toBeUndefined();
  });

  it('applica la dose massima quando superata (Adrenalina ACR 0.01 mg/kg max 1 mg, peso 150 kg)', () => {
    const rule: DosageRule = {
      kind: 'weight-based',
      factor: 0.01,
      unit: 'mg',
      route: 'EV/IO',
      maxDose: 1,
    };
    const result = calculate(rule, { weightKg: 150 });
    expect(result.entries[0].value).toBe('1.00');
    expect(result.entries[0].note).toContain('massima');
  });

  it('applica la dose minima quando non raggiunta (Atropina 0.02 mg/kg min 0.1 mg, peso 3 kg → 0.10)', () => {
    const rule: DosageRule = {
      kind: 'weight-based',
      factor: 0.02,
      unit: 'mg',
      route: 'EV',
      minDose: 0.1,
      maxDose: 0.5,
    };
    const result = calculate(rule, { weightKg: 3 });
    expect(result.entries[0].value).toBe('0.10');
    expect(result.entries[0].note).toContain('minima');
  });

  it('Adenosina 1a dose: 0.1 mg/kg × 15 kg = 1.50 mg', () => {
    const rule: DosageRule = {
      kind: 'weight-based',
      factor: 0.1,
      unit: 'mg',
      route: 'EV',
      maxDose: 6,
    };
    const result = calculate(rule, { weightKg: 15 });
    expect(result.entries[0].value).toBe('1.50');
  });

  it('Adenosina 2a dose: 0.2 mg/kg × 40 kg capped a 12 mg', () => {
    const rule: DosageRule = {
      kind: 'weight-based',
      factor: 0.2,
      unit: 'mg',
      route: 'EV',
      maxDose: 12,
    };
    const result = calculate(rule, { weightKg: 40 });
    expect(result.entries[0].value).toBe('8.00');
  });

  it('Acido Tranexamico 15 mg/kg × 20 kg = 300 mg', () => {
    const rule: DosageRule = {
      kind: 'weight-based',
      factor: 15,
      unit: 'mg',
      route: 'EV',
      maxDose: 1000,
      decimals: 0,
    };
    const result = calculate(rule, { weightKg: 20 });
    expect(result.entries[0].value).toBe('300');
  });

  it('Acido Tranexamico capped a 1000 mg su peso 80 kg', () => {
    const rule: DosageRule = {
      kind: 'weight-based',
      factor: 15,
      unit: 'mg',
      route: 'EV',
      maxDose: 1000,
      decimals: 0,
    };
    const result = calculate(rule, { weightKg: 80 });
    expect(result.entries[0].value).toBe('1000');
    expect(result.entries[0].note).toContain('massima');
  });

  it('Liquidi 20 mL/kg × 15 kg = 300 mL (0 decimali)', () => {
    const rule: DosageRule = {
      kind: 'weight-based',
      factor: 20,
      unit: 'mL',
      route: 'EV',
      decimals: 0,
    };
    const result = calculate(rule, { weightKg: 15 });
    expect(result.entries[0].value).toBe('300');
    expect(result.entries[0].unit).toBe('mL');
  });
});

describe('calculator - weight-range', () => {
  it('Rocuronio 0.6-1.2 mg/kg × 20 kg = 12.0 - 24.0 mg', () => {
    const rule: DosageRule = {
      kind: 'weight-range',
      factorMin: 0.6,
      factorMax: 1.2,
      unit: 'mg',
      route: 'EV',
    };
    const result = calculate(rule, { weightKg: 20 });
    expect(result.entries[0].value).toBe('12.0 - 24.0');
  });

  it('Succinilcolina 1-2 mg/kg × 10 kg = 10.0 - 20.0 mg', () => {
    const rule: DosageRule = {
      kind: 'weight-range',
      factorMin: 1,
      factorMax: 2,
      unit: 'mg',
      route: 'EV',
    };
    const result = calculate(rule, { weightKg: 10 });
    expect(result.entries[0].value).toBe('10.0 - 20.0');
  });
});

describe('calculator - weight-band', () => {
  const glucagoneRule: DosageRule = {
    kind: 'weight-band',
    bands: [
      { minKg: 5, maxKg: 24, value: 0.5 },
      { minKg: 25, value: 1 },
    ],
    unit: 'mg',
    route: 'IM',
    outOfBandsMessage: 'Peso troppo basso (< 5 kg), consultare il medico',
  };

  it('Glucagone 15 kg = 0.5 mg', () => {
    const result = calculate(glucagoneRule, { weightKg: 15 });
    expect(result.entries[0].value).toBe('0.5');
  });

  it('Glucagone 30 kg = 1 mg', () => {
    const result = calculate(glucagoneRule, { weightKg: 30 });
    expect(result.entries[0].value).toBe('1.0');
  });

  it('Glucagone 3 kg (fuori range) lancia errore', () => {
    expect(() => calculate(glucagoneRule, { weightKg: 3 })).toThrow(CalculationError);
  });

  it('Paracetamolo EV < 10 kg = 7.5 mg/kg', () => {
    const rule: DosageRule = {
      kind: 'weight-band',
      bands: [
        { minKg: 0.1, maxKg: 9.99, displayValue: '7.5 mg/kg' },
        { minKg: 10, displayValue: '15 mg/kg' },
      ],
      unit: 'mg',
      route: 'EV',
    };
    const result = calculate(rule, { weightKg: 8 });
    expect(result.entries[0].value).toBe('7.5 mg/kg');
  });
});

describe('calculator - weight-age (Metilprednisolone)', () => {
  const rule: DosageRule = {
    kind: 'weight-age',
    bands: [
      { maxAgeYears: 2, factor: 2, maxDose: 20, label: '≤ 2 anni' },
      { maxAgeYears: 5, factor: 2, maxDose: 30, label: '3-5 anni' },
      { maxAgeYears: 11, factor: 2, maxDose: 40, label: '6-11 anni' },
      { maxAgeYears: Infinity, factor: 1, maxDose: 50, label: '≥ 12 anni' },
    ],
    unit: 'mg',
    route: 'EV',
  };

  it('1 anno, 10 kg → 20 mg (esattamente il max della fascia)', () => {
    const result = calculate(rule, { weightKg: 10, ageYears: 1 });
    expect(result.entries[0].value).toBe('20');
  });

  it('1 anno, 15 kg → 20 mg (capped)', () => {
    const result = calculate(rule, { weightKg: 15, ageYears: 1 });
    expect(result.entries[0].value).toBe('20');
    expect(result.entries[0].note).toContain('massima');
  });

  it('14 anni, 60 kg → 50 mg (capped fascia adulti)', () => {
    const result = calculate(rule, { weightKg: 60, ageYears: 14 });
    expect(result.entries[0].value).toBe('50');
  });

  it('richiede l\'età', () => {
    expect(() => calculate(rule, { weightKg: 20 })).toThrow(CalculationError);
  });
});

describe('calculator - shock (defibrillazione)', () => {
  it('Defibrillazione: produce 5 scariche progressive', () => {
    const rule: DosageRule = {
      kind: 'shock',
      unit: 'J',
      shocks: [
        { label: '1ª', factorMin: 2 },
        { label: '2ª', factorMin: 4 },
        { label: '3ª', factorMin: 6 },
        { label: '4ª', factorMin: 8 },
        { label: '5ª', factorMin: 10 },
      ],
    };
    const result = calculate(rule, { weightKg: 10 });
    expect(result.entries).toHaveLength(5);
    expect(result.entries[0].value).toBe('20');
    expect(result.entries[1].value).toBe('40');
    expect(result.entries[4].value).toBe('100');
  });

  it('Cardioversione: supporta scariche con range', () => {
    const rule: DosageRule = {
      kind: 'shock',
      unit: 'J',
      shocks: [
        { label: '1ª', factorMin: 0.5, factorMax: 1 },
        { label: '2ª', factorMin: 2 },
      ],
    };
    const result = calculate(rule, { weightKg: 20 });
    expect(result.entries[0].value).toBe('10 - 20');
    expect(result.entries[1].value).toBe('40');
  });
});
