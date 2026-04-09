import { describe, it, expect } from 'vitest';
import { calculateVitalSigns, VitalSignsError } from '../vitalSigns';

describe('vitalSigns - validazione', () => {
  it('rifiuta età negativa', () => {
    expect(() => calculateVitalSigns({ value: -1, unit: 'anni' })).toThrow(VitalSignsError);
  });

  it('rifiuta età NaN', () => {
    expect(() => calculateVitalSigns({ value: NaN, unit: 'anni' })).toThrow(VitalSignsError);
  });
});

describe('vitalSigns - fasce d\'età', () => {
  it('neonato 0 mesi: PA minima 60, fascia < 1 anno', () => {
    const r = calculateVitalSigns({ value: 0, unit: 'mesi' });
    expect(r.systolicBPMin).toBe('60 mmHg');
    expect(r.ageRangeLabel).toBe('< 1 anno (0-11 mesi)');
  });

  it('lattante 6 mesi: PA minima 70', () => {
    const r = calculateVitalSigns({ value: 6, unit: 'mesi' });
    expect(r.systolicBPMin).toBe('70 mmHg');
  });

  it('2 anni: PA minima formula 70+2×2 = 74', () => {
    const r = calculateVitalSigns({ value: 2, unit: 'anni' });
    expect(r.systolicBPMin).toContain('74 mmHg');
    expect(r.ageRangeLabel).toBe('1 - 5 anni');
  });

  it('8 anni: fascia 6-12 anni, FC 80-120', () => {
    const r = calculateVitalSigns({ value: 8, unit: 'anni' });
    expect(r.ageRangeLabel).toBe('6 - 12 anni');
    expect(r.heartRate).toBe('80-120 bpm');
  });

  it('15 anni: fascia > 12 anni, FR 15-20', () => {
    const r = calculateVitalSigns({ value: 15, unit: 'anni' });
    expect(r.ageRangeLabel).toBe('> 12 anni');
    expect(r.respiratoryRate).toBe('15-20 atti/min');
  });
});
