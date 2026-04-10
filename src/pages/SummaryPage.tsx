/**
 * Schermata riassuntiva paziente.
 * Mostra farmaci principali pre-calcolati, fascia device e parametri vitali
 * in un'unica schermata basata su peso (e opzionalmente età) dal PatientContext.
 */

import { useMemo } from 'react';
import type { View } from '../App';
import { usePatient } from '../context/PatientContext';
import { getDrugById } from '../data/drugs';
import { calculate, CalculationError } from '../lib/calculator';
import type { DosageRule } from '../types/drug';
import { findBand, DeviceSelectorError } from '../lib/deviceSelector';
import { calculateVitalSigns, VitalSignsError } from '../lib/vitalSigns';

interface SummaryPageProps {
  onNavigate: (view: View) => void;
}

interface SummaryEntry {
  label: string;
  drugId: string;
  indicationId: string;
  variantId?: string;
  section: string;
}

const SUMMARY_ENTRIES: SummaryEntry[] = [
  { section: 'ACR', label: 'Adrenalina', drugId: 'adrenalina', indicationId: 'acr' },
  { section: 'ACR', label: 'Amiodarone', drugId: 'amiodarone', indicationId: 'default' },
  { section: 'ACR', label: 'Atropina', drugId: 'atropina', indicationId: 'default' },
  { section: 'ACR', label: 'Defib. 1ª scarica', drugId: 'elettricita', indicationId: 'defibrillazione' },
  { section: 'Convulsioni', label: 'Midazolam IM', drugId: 'midazolam', indicationId: 'convulsioni', variantId: 'im' },
  { section: 'Convulsioni', label: 'Midazolam IN', drugId: 'midazolam', indicationId: 'convulsioni', variantId: 'in' },
  { section: 'Shock / Anafilassi', label: 'Liquidi (bolo)', drugId: 'liquidi', indicationId: 'default' },
  { section: 'Shock / Anafilassi', label: 'Adrenalina IM', drugId: 'adrenalina', indicationId: 'anafilassi' },
];

const SECTION_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  'ACR': {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-900 dark:text-rose-100',
    border: 'border-rose-200 dark:border-rose-800',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200',
  },
  'Convulsioni': {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-900 dark:text-amber-100',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  },
  'Shock / Anafilassi': {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-900 dark:text-blue-100',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  },
};

function getRule(entry: SummaryEntry): DosageRule | null {
  const drug = getDrugById(entry.drugId);
  if (!drug) return null;
  const indication = drug.indications.find((i) => i.id === entry.indicationId);
  if (!indication) return null;
  if (entry.variantId && indication.routeVariants) {
    const variant = indication.routeVariants.find((v) => v.id === entry.variantId);
    if (variant) return variant.rule;
  }
  return indication.rule;
}

export function SummaryPage({ onNavigate }: SummaryPageProps) {
  const { weight, age, ageUnit } = usePatient();
  const weightNum = parseFloat(weight);
  const ageNum = age ? parseFloat(age) : undefined;
  const ageYears =
    ageNum !== undefined && Number.isFinite(ageNum)
      ? ageUnit === 'mesi' ? ageNum / 12 : ageNum
      : undefined;

  const hasWeight = Number.isFinite(weightNum) && weightNum > 0;

  // Calcola tutti i farmaci
  const drugResults = useMemo(() => {
    if (!hasWeight) return [];
    return SUMMARY_ENTRIES.map((entry) => {
      const rule = getRule(entry);
      if (!rule) return { entry, value: '—', unit: '', route: '', capped: false };
      try {
        const result = calculate(rule, { weightKg: weightNum, ageYears });
        const first = result.entries[0];
        return {
          entry,
          value: first.value,
          unit: first.unit,
          route: first.route ?? '',
          capped: first.note?.includes('massima') ?? false,
        };
      } catch (e) {
        if (e instanceof CalculationError) return { entry, value: '—', unit: '', route: '', capped: false };
        return { entry, value: '—', unit: '', route: '', capped: false };
      }
    });
  }, [hasWeight, weightNum, ageYears]);

  // Fascia device
  const deviceBand = useMemo(() => {
    if (!hasWeight) return null;
    try { return findBand({ kind: 'weight', kg: weightNum }); }
    catch (e) { if (e instanceof DeviceSelectorError) return null; return null; }
  }, [hasWeight, weightNum]);

  // Parametri vitali
  const vitalSigns = useMemo(() => {
    if (ageYears === undefined) return null;
    try {
      const input = ageUnit === 'mesi'
        ? { value: ageNum!, unit: 'mesi' as const }
        : { value: ageNum!, unit: 'anni' as const };
      return calculateVitalSigns(input);
    } catch (e) { if (e instanceof VitalSignsError) return null; return null; }
  }, [ageYears, ageNum, ageUnit]);

  // Raggruppa per sezione
  const sections = useMemo(() => {
    const map = new Map<string, typeof drugResults>();
    for (const r of drugResults) {
      const sec = r.entry.section;
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(r);
    }
    return Array.from(map.entries());
  }, [drugResults]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'home' })}
          className="btn-ghost inline-flex items-center gap-1.5"
        >
          <span aria-hidden="true">←</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.432Z" />
          </svg>
          Home
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Riepilogo</h1>
        <div className="w-16" />
      </div>

      {!hasWeight && (
        <div className="card text-center text-slate-500 dark:text-slate-400">
          <p className="text-sm">Inserisci il peso del paziente nella Home per visualizzare il riepilogo.</p>
          <button
            type="button"
            onClick={() => onNavigate({ name: 'home' })}
            className="btn-primary mt-4 mx-auto"
          >
            Vai alla Home
          </button>
        </div>
      )}

      {hasWeight && (
        <div className="space-y-4">
          {/* Info paziente */}
          <div className="card flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Peso</p>
              <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">{weightNum} kg</p>
            </div>
            {ageNum !== undefined && Number.isFinite(ageNum) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Età</p>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                  {ageNum} {ageUnit}
                </p>
              </div>
            )}
            {deviceBand && (
              <div className="ml-auto">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Fascia</p>
                <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{deviceBand.label}</p>
                <p className="text-xs text-slate-500">{deviceBand.weightLabel}</p>
              </div>
            )}
          </div>

          {/* Parametri vitali */}
          {vitalSigns && (
            <div className="card">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
                  Parametri vitali — {vitalSigns.ageRangeLabel}
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate({ name: 'vital-signs' })}
                  className="text-xs text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
                >
                  dettaglio →
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xs text-slate-500">FR</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{vitalSigns.respiratoryRate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">FC</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{vitalSigns.heartRate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">PAs range</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{vitalSigns.systolicBPRange}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">PAs min</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{vitalSigns.systolicBPMin}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sezioni farmaci */}
          {sections.map(([sectionName, items]) => {
            const s = SECTION_COLORS[sectionName] ?? SECTION_COLORS['ACR'];
            return (
              <div key={sectionName} className={`rounded-2xl border-2 p-4 ${s.border} ${s.bg}`}>
                <h2 className={`mb-3 text-sm font-bold uppercase tracking-wide ${s.text}`}>
                  {sectionName}
                </h2>
                <div className="space-y-2">
                  {items.map(({ entry, value, unit, route, capped }) => (
                    <div key={`${entry.drugId}-${entry.indicationId}-${entry.variantId ?? ''}`}
                      className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-medium ${s.text}`}>{entry.label}</span>
                      <span className="flex items-center gap-1.5">
                        {capped && (
                          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                            MAX
                          </span>
                        )}
                        <span className={`text-base font-bold ${s.text}`}>
                          {value} {unit}
                        </span>
                        {route && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.badge}`}>
                            {route}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Link dettaglio */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button type="button" onClick={() => onNavigate({ name: 'drugs' })}
              className="btn-ghost text-sm">Tutti i farmaci →</button>
            <button type="button" onClick={() => onNavigate({ name: 'devices' })}
              className="btn-ghost text-sm">Device →</button>
          </div>
        </div>
      )}
    </div>
  );
}
