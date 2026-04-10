import { describe, it, expect } from 'vitest';
import { findBand, DeviceSelectorError } from '../deviceSelector';

describe('deviceSelector - peso', () => {
  it('5 kg → rosso', () => {
    expect(findBand({ kind: 'weight', kg: 5 }).id).toBe('rosso');
  });
  it('8 kg → rosso (estremo alto)', () => {
    expect(findBand({ kind: 'weight', kg: 8 }).id).toBe('rosso');
  });
  it('9 kg → giallo', () => {
    expect(findBand({ kind: 'weight', kg: 9 }).id).toBe('giallo');
  });
  it('16 kg → verde', () => {
    expect(findBand({ kind: 'weight', kg: 16 }).id).toBe('verde');
  });
  it('20 kg → arancione', () => {
    expect(findBand({ kind: 'weight', kg: 20 }).id).toBe('arancione');
  });
  it('27 kg → viola', () => {
    expect(findBand({ kind: 'weight', kg: 27 }).id).toBe('viola');
  });
  it('35 kg → bianco', () => {
    expect(findBand({ kind: 'weight', kg: 35 }).id).toBe('bianco');
  });
  it('40 kg → bianco (estremo alto)', () => {
    expect(findBand({ kind: 'weight', kg: 40 }).id).toBe('bianco');
  });
  it('4 kg → errore (sotto range)', () => {
    expect(() => findBand({ kind: 'weight', kg: 4 })).toThrow(DeviceSelectorError);
  });
  it('50 kg → errore (sopra range)', () => {
    expect(() => findBand({ kind: 'weight', kg: 50 })).toThrow(DeviceSelectorError);
  });
  it('0 kg → errore (non valido)', () => {
    expect(() => findBand({ kind: 'weight', kg: 0 })).toThrow(DeviceSelectorError);
  });
});

describe('deviceSelector - altezza', () => {
  it('55 cm → rosso', () => {
    expect(findBand({ kind: 'height', cm: 55 }).id).toBe('rosso');
  });
  it('80 cm → giallo', () => {
    expect(findBand({ kind: 'height', cm: 80 }).id).toBe('giallo');
  });
  it('100 cm → verde', () => {
    expect(findBand({ kind: 'height', cm: 100 }).id).toBe('verde');
  });
  it('115 cm → arancione', () => {
    expect(findBand({ kind: 'height', cm: 115 }).id).toBe('arancione');
  });
  it('130 cm → viola', () => {
    expect(findBand({ kind: 'height', cm: 130 }).id).toBe('viola');
  });
  it('140 cm → bianco', () => {
    expect(findBand({ kind: 'height', cm: 140 }).id).toBe('bianco');
  });
  it('40 cm → errore (sotto range)', () => {
    expect(() => findBand({ kind: 'height', cm: 40 })).toThrow(DeviceSelectorError);
  });
  it('160 cm → errore (sopra range)', () => {
    expect(() => findBand({ kind: 'height', cm: 160 })).toThrow(DeviceSelectorError);
  });
});

describe('deviceSelector - età in mesi', () => {
  it('6 mesi → rosso', () => {
    expect(findBand({ kind: 'age', value: 6, unit: 'mesi' }).id).toBe('rosso');
  });
  it('11 mesi → rosso (estremo alto)', () => {
    expect(findBand({ kind: 'age', value: 11, unit: 'mesi' }).id).toBe('rosso');
  });
  it('12 mesi → giallo', () => {
    expect(findBand({ kind: 'age', value: 12, unit: 'mesi' }).id).toBe('giallo');
  });
  it('24 mesi → giallo', () => {
    expect(findBand({ kind: 'age', value: 24, unit: 'mesi' }).id).toBe('giallo');
  });
  it('2 mesi → errore (troppo piccolo)', () => {
    expect(() => findBand({ kind: 'age', value: 2, unit: 'mesi' })).toThrow(
      DeviceSelectorError
    );
  });
});

describe('deviceSelector - età in anni', () => {
  it('1 anno → giallo', () => {
    expect(findBand({ kind: 'age', value: 1, unit: 'anni' }).id).toBe('giallo');
  });
  it('2 anni → giallo', () => {
    expect(findBand({ kind: 'age', value: 2, unit: 'anni' }).id).toBe('giallo');
  });
  it('3 anni → verde', () => {
    expect(findBand({ kind: 'age', value: 3, unit: 'anni' }).id).toBe('verde');
  });
  it('4 anni → verde', () => {
    expect(findBand({ kind: 'age', value: 4, unit: 'anni' }).id).toBe('verde');
  });
  it('5 anni → arancione', () => {
    expect(findBand({ kind: 'age', value: 5, unit: 'anni' }).id).toBe('arancione');
  });
  it('7 anni → arancione', () => {
    expect(findBand({ kind: 'age', value: 7, unit: 'anni' }).id).toBe('arancione');
  });
  it('8 anni → viola', () => {
    expect(findBand({ kind: 'age', value: 8, unit: 'anni' }).id).toBe('viola');
  });
  it('9 anni → viola', () => {
    expect(findBand({ kind: 'age', value: 9, unit: 'anni' }).id).toBe('viola');
  });
  it('10 anni → bianco', () => {
    expect(findBand({ kind: 'age', value: 10, unit: 'anni' }).id).toBe('bianco');
  });
  it('12 anni → bianco', () => {
    expect(findBand({ kind: 'age', value: 12, unit: 'anni' }).id).toBe('bianco');
  });
  it('13 anni → errore (troppo grande)', () => {
    expect(() => findBand({ kind: 'age', value: 13, unit: 'anni' })).toThrow(
      DeviceSelectorError
    );
  });
});

describe('deviceSelector - dati device', () => {
  it('rosso contiene tutti i device richiesti', () => {
    const band = findBand({ kind: 'weight', kg: 6 });
    expect(band.devices.cannulaOrofaringea).toBe('40-50 mm');
    expect(band.devices.sondaAspirazione).toBe('8 Fr');
    expect(band.devices.tuboEndotracheale).toContain('3,5-4');
    expect(band.devices.cv).toBe('8 Fr');
  });
  it('bianco ha tubo laringeo 3 e SNG 18 Fr', () => {
    const band = findBand({ kind: 'weight', kg: 35 });
    expect(band.devices.tuboLaringeo).toBe('3');
    expect(band.devices.sng).toBe('18 Fr');
  });
});
