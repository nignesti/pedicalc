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
  /** Soglia SpO2 sotto la quale è necessaria ventilazione assistita (uguale per tutte le età). */
  spo2Alert: string;
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

  // PA sistolica minima — formula pediatrica valida solo fino a 12 anni
  let systolicBPMin: string;
  if (ageInMonths <= 1) {
    systolicBPMin = '60 mmHg';
  } else if (ageInMonths <= 12) {
    systolicBPMin = '70 mmHg';
  } else if (ageInYears <= 12) {
    const pa = Math.round(70 + 2 * ageInYears);
    systolicBPMin = `${pa} mmHg (70 + 2 × anni)`;
  } else {
    systolicBPMin = '100 mmHg';
  }

  // Range standard per età
  let ageRangeLabel: string;
  let respiratoryRate: string;
  let heartRate: string;
  let systolicBPRange: string;

  if (ageInMonths <= 3) {
    ageRangeLabel = '0 - 3 mesi';
    respiratoryRate = '40-60 atti/min';
    heartRate = '120-160 bpm';
    systolicBPRange = '60-80 mmHg';
  } else if (ageInMonths <= 12) {
    ageRangeLabel = '4 - 12 mesi';
    respiratoryRate = '30-40 atti/min';
    heartRate = '110-160 bpm';
    systolicBPRange = '70-90 mmHg';
  } else if (ageInYears <= 3) {
    ageRangeLabel = '1 - 3 anni';
    respiratoryRate = '25-35 atti/min';
    heartRate = '90-140 bpm';
    systolicBPRange = '80-95 mmHg';
  } else if (ageInYears <= 7) {
    ageRangeLabel = '4 - 7 anni';
    respiratoryRate = '20-30 atti/min';
    heartRate = '80-120 bpm';
    systolicBPRange = '85-100 mmHg';
  } else if (ageInYears <= 12) {
    ageRangeLabel = '8 - 12 anni';
    respiratoryRate = '18-25 atti/min';
    heartRate = '70-110 bpm';
    systolicBPRange = '90-110 mmHg';
  } else {
    ageRangeLabel = '> 12 anni';
    respiratoryRate = '12-20 atti/min';
    heartRate = '60-100 bpm';
    systolicBPRange = '100-120 mmHg';
  }

  return {
    ageRangeLabel,
    respiratoryRate,
    heartRate,
    systolicBPMin,
    systolicBPRange,
    spo2Alert: '≤ 90% → ventilazione assistita',
  };
}
