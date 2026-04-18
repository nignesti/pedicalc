/**
 * Schermata "Emergenza — Dosi pronte".
 * Mostra farmaci principali pre-calcolati, fascia device e parametri vitali
 * organizzati per scenario clinico (ACR, Convulsioni, Anafilassi, ecc.)
 * in base al peso (e opzionalmente età) dal PatientContext.
 */

import { useMemo, useState } from 'react';
import type { View } from '../App';
import { usePatient } from '../context/PatientContext';
import { getDrugById } from '../data/drugs';
import { calculate, CalculationError } from '../lib/calculator';
import type { DosageRule } from '../types/drug';
import { findBand, DeviceSelectorError } from '../lib/deviceSelector';
import { calculateVitalSigns, VitalSignsError } from '../lib/vitalSigns';
import { ACRTimerModal } from '../components/ACRTimerModal';

interface SummaryPageProps {
  onNavigate: (view: View) => void;
}

/** Ordine di visualizzazione delle sezioni. */
const SECTION_ORDER = [
  'ACR',
  'Convulsioni',
  'Anafilassi',
  'Bradiaritmia',
  'Analgesia',
  'RSI',
  'Ipoglicemia',
] as const;
type SectionName = (typeof SECTION_ORDER)[number];

interface SummaryEntry {
  section: SectionName;
  label: string;
  drugId: string;
  /** indicationId statico, oppure funzione che risolve in base al peso (per paracetamolo, succinilcolina). */
  indicationId: string | ((weightKg: number) => string);
  variantId?: string;
}

const SUMMARY_ENTRIES: SummaryEntry[] = [
  // ACR
  { section: 'ACR', label: 'Adrenalina', drugId: 'adrenalina', indicationId: 'acr' },
  { section: 'ACR', label: 'Amiodarone', drugId: 'amiodarone', indicationId: 'default' },
  { section: 'ACR', label: 'Defibrillazione', drugId: 'elettricita', indicationId: 'defibrillazione' },

  // Convulsioni
  { section: 'Convulsioni', label: 'Midazolam EV', drugId: 'midazolam', indicationId: 'convulsioni', variantId: 'ev' },
  { section: 'Convulsioni', label: 'Midazolam IM', drugId: 'midazolam', indicationId: 'convulsioni', variantId: 'im' },
  { section: 'Convulsioni', label: 'Midazolam IN', drugId: 'midazolam', indicationId: 'convulsioni', variantId: 'in' },

  // Anafilassi
  { section: 'Anafilassi', label: 'Liquidi (bolo)', drugId: 'liquidi', indicationId: 'default' },
  { section: 'Anafilassi', label: 'Adrenalina IM', drugId: 'adrenalina', indicationId: 'anafilassi' },
  { section: 'Anafilassi', label: 'Idrocortisone', drugId: 'idrocortisone', indicationId: 'default' },

  // Bradiaritmia
  { section: 'Bradiaritmia', label: 'Atropina', drugId: 'atropina', indicationId: 'default' },

  // Analgesia
  { section: 'Analgesia', label: 'Fentanile', drugId: 'fentanile', indicationId: 'default' },
  { section: 'Analgesia', label: 'Ketamina', drugId: 'ketamina', indicationId: 'analgesia' },
  { section: 'Analgesia', label: 'Morfina', drugId: 'morfina', indicationId: 'default' },
  {
    section: 'Analgesia',
    label: 'Paracetamolo',
    drugId: 'paracetamolo',
    indicationId: (w) => (w >= 10 ? 'sopra-10kg' : 'sotto-10kg'),
  },

  // RSI (Rapid Sequence Intubation)
  { section: 'RSI', label: 'Fentanile', drugId: 'fentanile', indicationId: 'default' },
  { section: 'RSI', label: 'Ketamina', drugId: 'ketamina', indicationId: 'sedazione' },
  { section: 'RSI', label: 'Midazolam', drugId: 'midazolam', indicationId: 'sedazione', variantId: 'ev-im' },
  { section: 'RSI', label: 'Rocuronio', drugId: 'rocuronio', indicationId: 'rsi' },
  {
    section: 'RSI',
    label: 'Succinilcolina',
    drugId: 'succinilcolina',
    indicationId: (w) => (w >= 10 ? 'sopra-10kg' : 'sotto-10kg'),
  },

  // Ipoglicemia
  { section: 'Ipoglicemia', label: 'Glucagone', drugId: 'glucagone', indicationId: 'default' },
  { section: 'Ipoglicemia', label: 'Glucosio 10%', drugId: 'glucosio', indicationId: 'default' },
];

/** Palette per sezione — colori distinti per scorrere rapidamente in emergenza. */
const SECTION_COLORS: Record<SectionName, { bg: string; text: string; border: string; badge: string }> = {
  ACR: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-900 dark:text-rose-100',
    border: 'border-rose-300 dark:border-rose-800',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200',
  },
  Convulsioni: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-900 dark:text-amber-100',
    border: 'border-amber-300 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  },
  Anafilassi: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-900 dark:text-blue-100',
    border: 'border-blue-300 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  },
  Bradiaritmia: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-900 dark:text-purple-100',
    border: 'border-purple-300 dark:border-purple-800',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
  },
  Analgesia: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-900 dark:text-emerald-100',
    border: 'border-emerald-300 dark:border-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  },
  RSI: {
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    text: 'text-slate-900 dark:text-slate-100',
    border: 'border-slate-300 dark:border-slate-700',
    badge: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
  },
  Ipoglicemia: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-900 dark:text-orange-100',
    border: 'border-orange-300 dark:border-orange-800',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
  },
};

function resolveIndicationId(entry: SummaryEntry, weightKg: number): string {
  return typeof entry.indicationId === 'function' ? entry.indicationId(weightKg) : entry.indicationId;
}

function getRule(entry: SummaryEntry, weightKg: number): DosageRule | null {
  const drug = getDrugById(entry.drugId);
  if (!drug) return null;
  const indicationId = resolveIndicationId(entry, weightKg);
  const indication = drug.indications.find((i) => i.id === indicationId);
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
      const rule = getRule(entry, weightNum);
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

  const [timerOpen, setTimerOpen] = useState(false);

  // Accordion: tutte le sezioni aperte di default
  const [openSections, setOpenSections] = useState<Set<SectionName>>(
    () => new Set(SECTION_ORDER)
  );
  function toggleSection(name: SectionName) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  // Raggruppa per sezione rispettando SECTION_ORDER
  const sections = useMemo(() => {
    const map = new Map<SectionName, typeof drugResults>();
    for (const r of drugResults) {
      const sec = r.entry.section;
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(r);
    }
    return SECTION_ORDER.filter((s) => map.has(s)).map((s) => [s, map.get(s)!] as const);
  }, [drugResults]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
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
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white dark:bg-rose-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">Emergenza</h1>
        </div>
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
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-300">Peso</p>
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{weightNum} kg</p>
            </div>
            {ageNum !== undefined && Number.isFinite(ageNum) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-300">Età</p>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                  {ageNum} {ageUnit}
                </p>
              </div>
            )}
            {deviceBand && (
              <div className="ml-auto">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-300">Fascia</p>
                <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{deviceBand.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{deviceBand.weightLabel}</p>
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
                  className="text-xs text-slate-400 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition"
                >
                  dettaglio →
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">FR</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{vitalSigns.respiratoryRate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">FC</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{vitalSigns.heartRate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PAs range</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{vitalSigns.systolicBPRange}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PAs min</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{vitalSigns.systolicBPMin}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sezioni farmaci — accordion */}
          {sections.map(([sectionName, items]) => {
            const s = SECTION_COLORS[sectionName];
            const isOpen = openSections.has(sectionName);
            return (
              <div key={sectionName} className={`overflow-hidden rounded-2xl border-2 ${s.border} ${s.bg}`}>
                {/* Header accordion — toccabile */}
                <button
                  type="button"
                  onClick={() => toggleSection(sectionName)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <h2 className={`text-sm font-bold uppercase tracking-wide ${s.text}`}>
                      {sectionName}
                    </h2>
                    {sectionName === 'ACR' && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setTimerOpen(true); }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-sm transition hover:bg-rose-500 active:bg-rose-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                          <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                        </svg>
                        Timer ACR
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isOpen && (
                      <span className={`text-xs opacity-60 ${s.text}`}>
                        {items.length} {items.length === 1 ? 'farmaco' : 'farmaci'}
                      </span>
                    )}
                    {/* Chevron animato */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${s.text} opacity-60`}
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>

                {/* Contenuto collassabile */}
                {isOpen && (
                  <div className="space-y-2 px-4 pb-4">
                    {items.map(({ entry, value, unit, route, capped }) => (
                      <div
                        key={`${entry.drugId}-${entry.section}-${entry.label}`}
                        className="flex items-center justify-between gap-2"
                      >
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
                )}
              </div>
            );
          })}

          {timerOpen && (
            <ACRTimerModal onClose={() => setTimerOpen(false)} weightKg={weightNum} />
          )}

          {/* Link dettaglio */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button type="button" onClick={() => onNavigate({ name: 'drugs' })}
              className="btn-ghost text-sm">Tutti i farmaci →</button>
            <button type="button" onClick={() => onNavigate({ name: 'vital-signs' })}
              className="btn-ghost text-sm">Parametri vitali →</button>
            <button type="button" onClick={() => onNavigate({ name: 'devices' })}
              className="btn-ghost text-sm">Device →</button>
          </div>
        </div>
      )}
    </div>
  );
}
