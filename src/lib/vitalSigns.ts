/**
 * Calcolo dei range di parametri vitali pediatrici in base all'età.
 *
 * Funzione pura e testabile.
 * Input: età (con unità mesi/anni)
 * Output: FR, FC, PA sistolica minima e range standard, + etichetta fascia d'età.
 */

export type AgeUnit = 'mesi' | 'anni';

export interface VitalSignsInput {
  value: number;
  unit: AgeUnit;
}

export interface VitalSignsResult {
  ageRangeLabel: string;
  respiratoryRate: string;
  heartRate: string;
  systolicBPMin: string;
  systolicBPRange: string;
}

export class VitalSignsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VitalSignsError';
  }
}

export function calculateVitalSigns(input: VitalSignsInput): VitalSignsResult {
  if (!Number.isFinite(input.value) || input.value < 0) {
    throw new VitalSignsError('Inserisci un\'età valida (numero positivo).');
  }

  const ageInMonths = input.unit === 'mesi' ? input.value : input.value * 12;
  const ageInYears = input.unit === 'anni' ? input.value : input.value / 12;

  // PA sistolica minima
  let systolicBPMin: string;
  if (ageInMonths <= 1) {
    systolicBPMin = '60 mmHg';
  } else if (ageInMonths <= 12) {
    systolicBPMin = '70 mmHg';
  } else {
    const pa = Math.round(70 + 2 * ageInYears);
    systolicBPMin = `${pa} mmHg (70 + 2 × anni)`;
  }

  // Range standard per età
  let ageRangeLabel: string;
  let respiratoryRate: string;
  let heartRate: string;
  let systolicBPRange: string;

  if (ageInYears < 1) {
    ageRangeLabel = '< 1 anno (0-11 mesi)';
    respiratoryRate = '30-40 atti/min';
    heartRate = '110-160 bpm';
    systolicBPRange = '70-90 mmHg';
  } else if (ageInYears <= 5) {
    ageRangeLabel = '1 - 5 anni';
    respiratoryRate = '25-30 atti/min';
    heartRate = '95-140 bpm';
    systolicBPRange = '80-100 mmHg';
  } else if (ageInYears <= 12) {
    ageRangeLabel = '6 - 12 anni';
    respiratoryRate = '20-25 atti/min';
    heartRate = '80-120 bpm';
    systolicBPRange = '90-110 mmHg';
  } else {
    ageRangeLabel = '> 12 anni';
    respiratoryRate = '15-20 atti/min';
    heartRate = '60-100 bpm';
    systolicBPRange = '100-120 mmHg';
  }

  return {
    ageRangeLabel,
    respiratoryRate,
    heartRate,
    systolicBPMin,
    systolicBPRange,
  };
}
