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
  it('neonato 0 mesi: fascia 0-3 mesi, FR 40-60', () => {
    const r = calculateVitalSigns({ value: 0, unit: 'mesi' });
    expect(r.ageRangeLabel).toBe('0 - 3 mesi');
    expect(r.respiratoryRate).toBe('40-60 atti/min');
    expect(r.heartRate).toBe('120-160 bpm');
    expect(r.systolicBPMin).toBe('60 mmHg');
  });

  it('2 mesi: fascia 0-3 mesi', () => {
    const r = calculateVitalSigns({ value: 2, unit: 'mesi' });
    expect(r.ageRangeLabel).toBe('0 - 3 mesi');
  });

  it('6 mesi: fascia 4-12 mesi, PA minima 70', () => {
    const r = calculateVitalSigns({ value: 6, unit: 'mesi' });
    expect(r.ageRangeLabel).toBe('4 - 12 mesi');
    expect(r.systolicBPMin).toBe('70 mmHg');
  });

  it('2 anni: fascia 1-3 anni, PA minima formula 74', () => {
    const r = calculateVitalSigns({ value: 2, unit: 'anni' });
    expect(r.ageRangeLabel).toBe('1 - 3 anni');
    expect(r.systolicBPMin).toContain('74 mmHg');
    expect(r.heartRate).toBe('90-140 bpm');
  });

  it('5 anni: fascia 4-7 anni', () => {
    const r = calculateVitalSigns({ value: 5, unit: 'anni' });
    expect(r.ageRangeLabel).toBe('4 - 7 anni');
    expect(r.respiratoryRate).toBe('20-30 atti/min');
  });

  it('10 anni: fascia 8-12 anni, FC 70-110', () => {
    const r = calculateVitalSigns({ value: 10, unit: 'anni' });
    expect(r.ageRangeLabel).toBe('8 - 12 anni');
    expect(r.heartRate).toBe('70-110 bpm');
  });

  it('15 anni: fascia > 12 anni, FR 12-20, PAs min 100 mmHg (no formula)', () => {
    const r = calculateVitalSigns({ value: 15, unit: 'anni' });
    expect(r.ageRangeLabel).toBe('> 12 anni');
    expect(r.respiratoryRate).toBe('12-20 atti/min');
    expect(r.systolicBPMin).toBe('100 mmHg');
  });
});
