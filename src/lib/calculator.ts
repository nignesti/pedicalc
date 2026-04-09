/**
 * Motore di calcolo unico per tutti i farmaci.
 *
 * Riceve una DosageRule e il peso (+ eventualmente età), restituisce un CalculationResult
 * con la dose calcolata, l'unità, eventuali note e se sono stati applicati clamp min/max.
 *
 * Questa funzione è PURA: nessun side effect, nessuna dipendenza da DOM o React.
 * Questo la rende testabile al 100% con Vitest — ogni farmaco avrà i suoi test.
 */

import type { DosageRule, DoseUnit, Route } from '../types/drug';

export interface CalculationInput {
  weightKg: number;
  ageYears?: number;
}

/** Un singolo pezzo del risultato (una dose, una scarica, un valore). */
export interface ResultEntry {
  label?: string;
  /** Valore numerico formattato (stringa) — es. "0.50", "12-14". */
  value: string;
  unit: DoseUnit;
  route?: Route;
  /** Nota applicata a questo entry (es. "Dose massima applicata"). */
  note?: string;
}

export interface CalculationResult {
  entries: ResultEntry[];
  /** Note generali sul calcolo (info cliniche). */
  notes?: string;
}

export class CalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CalculationError';
  }
}

function formatNumber(n: number, decimals: number): string {
  return n.toFixed(decimals);
}

function validateWeight(weightKg: number): void {
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    throw new CalculationError('Inserisci un peso valido (kg).');
  }
}

/**
 * Calcola il risultato per una regola di dosaggio qualsiasi.
 * Lancia CalculationError se l'input non è valido.
 */
export function calculate(rule: DosageRule, input: CalculationInput): CalculationResult {
  validateWeight(input.weightKg);

  switch (rule.kind) {
    case 'weight-based':
      return calculateWeightBased(rule, input);
    case 'weight-range':
      return calculateWeightRange(rule, input);
    case 'weight-band':
      return calculateWeightBand(rule, input);
    case 'weight-age':
      return calculateWeightAge(rule, input);
    case 'shock':
      return calculateShock(rule, input);
  }
}

function calculateWeightBased(
  rule: Extract<DosageRule, { kind: 'weight-based' }>,
  input: CalculationInput
): CalculationResult {
  const decimals = rule.decimals ?? 2;
  const raw = input.weightKg * rule.factor;
  let dose = raw;
  let note: string | undefined;

  if (rule.minDose !== undefined && dose < rule.minDose) {
    dose = rule.minDose;
    note = `Dose minima ${formatNumber(rule.minDose, decimals)} ${rule.unit} applicata`;
  }
  if (rule.maxDose !== undefined && dose > rule.maxDose) {
    dose = rule.maxDose;
    note = `Dose massima ${formatNumber(rule.maxDose, decimals)} ${rule.unit} applicata`;
  }

  return {
    entries: [
      {
        value: formatNumber(dose, decimals),
        unit: rule.unit,
        route: rule.route,
        note,
      },
    ],
    notes: rule.notes,
  };
}

function calculateWeightRange(
  rule: Extract<DosageRule, { kind: 'weight-range' }>,
  input: CalculationInput
): CalculationResult {
  const decimals = rule.decimals ?? 1;
  let min = input.weightKg * rule.factorMin;
  let max = input.weightKg * rule.factorMax;
  let note: string | undefined;

  if (rule.maxDose !== undefined) {
    if (max > rule.maxDose) {
      max = rule.maxDose;
      note = `Dose massima ${formatNumber(rule.maxDose, decimals)} ${rule.unit} applicata`;
    }
    if (min > rule.maxDose) min = rule.maxDose;
  }

  return {
    entries: [
      {
        value: `${formatNumber(min, decimals)} - ${formatNumber(max, decimals)}`,
        unit: rule.unit,
        route: rule.route,
        note,
      },
    ],
    notes: rule.notes,
  };
}

function calculateWeightBand(
  rule: Extract<DosageRule, { kind: 'weight-band' }>,
  input: CalculationInput
): CalculationResult {
  const decimals = rule.decimals ?? 1;
  const band = rule.bands.find(
    (b) =>
      input.weightKg >= b.minKg && (b.maxKg === undefined || input.weightKg <= b.maxKg)
  );

  if (!band) {
    throw new CalculationError(
      rule.outOfBandsMessage ?? 'Il peso inserito non rientra nelle fasce previste.'
    );
  }

  const value =
    band.displayValue !== undefined
      ? band.displayValue
      : formatNumber(band.value ?? 0, decimals);

  return {
    entries: [
      {
        value,
        unit: rule.unit,
        route: rule.route,
      },
    ],
    notes: rule.notes,
  };
}

function calculateWeightAge(
  rule: Extract<DosageRule, { kind: 'weight-age' }>,
  input: CalculationInput
): CalculationResult {
  if (input.ageYears === undefined || input.ageYears < 0) {
    throw new CalculationError('Inserisci un\'età valida (anni).');
  }
  const decimals = rule.decimals ?? 0;
  const band = rule.bands.find((b) => input.ageYears! <= b.maxAgeYears);
  if (!band) {
    throw new CalculationError('Età fuori range previsto.');
  }

  const raw = input.weightKg * band.factor;
  const dose = Math.min(raw, band.maxDose);
  const note =
    raw > band.maxDose
      ? `Dose massima ${band.maxDose} ${rule.unit} applicata (fascia: ${band.label})`
      : `Fascia: ${band.label}`;

  return {
    entries: [
      {
        value: formatNumber(dose, decimals),
        unit: rule.unit,
        route: rule.route,
        note,
      },
    ],
    notes: rule.notes,
  };
}

function calculateShock(
  rule: Extract<DosageRule, { kind: 'shock' }>,
  input: CalculationInput
): CalculationResult {
  const entries: ResultEntry[] = rule.shocks.map((s) => {
    if (s.factorMax === undefined) {
      const value = Math.round(input.weightKg * s.factorMin);
      return {
        label: s.label,
        value: String(value),
        unit: rule.unit,
      };
    }
    const vMin = Math.round(input.weightKg * s.factorMin);
    const vMax = Math.round(input.weightKg * s.factorMax);
    return {
      label: s.label,
      value: `${vMin} - ${vMax}`,
      unit: rule.unit,
    };
  });

  return { entries, notes: rule.notes };
}
