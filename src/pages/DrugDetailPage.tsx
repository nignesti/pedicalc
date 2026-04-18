import { useMemo, useState } from 'react';
import type { View } from '../App';
import { getDrugById } from '../data/drugs';
import { PatientChip } from '../components/PatientChip';
import { calculate, CalculationError } from '../lib/calculator';
import type { CalculationResult } from '../lib/calculator';
import type { DosageRule, Indication } from '../types/drug';
import { usePatient } from '../context/PatientContext';

interface DrugDetailPageProps {
  drugId: string;
  onNavigate: (view: View) => void;
}

/** Farmaci con selezione indicazione automatica in base al peso-soglia 10 kg */
const WEIGHT_THRESHOLD_DRUGS = new Set(['paracetamolo', 'succinilcolina']);

export function DrugDetailPage({ drugId, onNavigate }: DrugDetailPageProps) {
  const drug = getDrugById(drugId);
  const { weight, setWeight, age, setAge } = usePatient();

  const [manualIndicationId, setManualIndicationId] = useState<string>(
    drug?.indications[0]?.id ?? ''
  );
  const [routeVariantId, setRouteVariantId] = useState<string | null>(null);

  /** Per farmaci peso-soglia, l'indicazione segue il peso automaticamente */
  const indicationId = useMemo(() => {
    if (!drug || !WEIGHT_THRESHOLD_DRUGS.has(drug.id)) return manualIndicationId;
    const w = parseFloat(weight);
    if (!Number.isFinite(w) || w <= 0) return manualIndicationId;
    return w < 10 ? 'sotto-10kg' : 'sopra-10kg';
  }, [drug, weight, manualIndicationId]);

  const weightNum = parseFloat(weight);
  const weightError = weight !== '' && Number.isFinite(weightNum) && weightNum < 1;
  const weightWarn = weight !== '' && Number.isFinite(weightNum) && weightNum > 100;

  const currentIndication = useMemo<Indication | undefined>(
    () => drug?.indications.find((i) => i.id === indicationId),
    [drug, indicationId]
  );

  // Quando l'indicazione ha varianti di via, usa la variante selezionata (se valida)
  const activeRule: DosageRule | undefined = useMemo(() => {
    if (!currentIndication) return undefined;
    if (currentIndication.routeVariants && routeVariantId) {
      const variant = currentIndication.routeVariants.find((v) => v.id === routeVariantId);
      if (variant) return variant.rule;
    }
    return currentIndication.rule;
  }, [currentIndication, routeVariantId]);

  const needsAge = activeRule?.kind === 'weight-age';

  const { result, error } = useMemo<{
    result: CalculationResult | null;
    error: string | null;
  }>(() => {
    if (!activeRule) return { result: null, error: null };
    const w = parseFloat(weight);
    if (!Number.isFinite(w) || w <= 0) return { result: null, error: null };
    const a = age ? parseFloat(age) : undefined;
    try {
      return {
        result: calculate(activeRule, { weightKg: w, ageYears: a }),
        error: null,
      };
    } catch (e) {
      if (e instanceof CalculationError) {
        return { result: null, error: e.message };
      }
      return { result: null, error: 'Errore nel calcolo' };
    }
  }, [activeRule, weight, age]);

  if (!drug) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-slate-600 dark:text-slate-400">Farmaco non trovato.</p>
        <button
          type="button"
          onClick={() => onNavigate({ name: 'drugs' })}
          className="btn-ghost mt-4"
        >
          ← Torna alla lista
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'drugs' })}
          className="btn-ghost"
        >
          ← Farmaci
        </button>
        <PatientChip />
        <button
          type="button"
          onClick={() => onNavigate({ name: 'home' })}
          className="btn-ghost inline-flex items-center gap-1.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.432Z" />
          </svg>
          Home
        </button>
      </div>

      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{drug.name}</h1>

        {/* Selettore indicazione se ce n'è più di una */}
        {drug.indications.length > 1 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Indicazione
            </p>
            <div className="flex flex-wrap gap-2">
              {drug.indications.map((ind) => (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => {
                    setManualIndicationId(ind.id);
                    setRouteVariantId(null);
                  }}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    indicationId === ind.id
                      ? 'pill-selected'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:bg-slate-700'
                  }`}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentIndication?.description && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {currentIndication.description}
          </p>
        )}

        {/* Selettore via di somministrazione */}
        {currentIndication?.routeVariants && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Via di somministrazione
            </p>
            <div className="flex flex-wrap gap-2">
              {currentIndication.routeVariants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setRouteVariantId(v.id)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    routeVariantId === v.id
                      ? 'pill-selected'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:bg-slate-700'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input peso e (se serve) età */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="weight" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Peso (kg)
            </label>
            <input
              id="weight"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input-field"
              placeholder="Es. 15"
              autoFocus
            />
            {weightError && (
              <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                Peso troppo basso — verifica il dato inserito.
              </p>
            )}
            {weightWarn && (
              <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                Peso insolito per un paziente pediatrico — verifica.
              </p>
            )}
          </div>
          {needsAge && (
            <div>
              <label htmlFor="age" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Età (anni)
              </label>
              <input
                id="age"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-field"
                placeholder="Es. 4"
              />
            </div>
          )}
        </div>

        {/* Risultato */}
        {error && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-2xl border-2 border-brand-200 bg-brand-50 p-5 dark:border-brand-600 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
              Dose calcolata
            </p>
            <div className="mt-3 space-y-3">
              {result.entries.map((entry, idx) => (
                <div key={idx} className="flex items-baseline gap-3">
                  {entry.label && (
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {entry.label}:
                    </span>
                  )}
                  <span className="text-3xl font-bold text-brand-800 dark:text-brand-200">
                    {entry.value}
                  </span>
                  <span className="text-lg font-medium text-brand-700 dark:text-brand-300">
                    {entry.unit}
                  </span>
                  {entry.route && (
                    <span className="rounded-md bg-brand-200/60 px-2 py-0.5 text-xs font-semibold text-brand-800 dark:bg-brand-700 dark:text-brand-100">
                      {entry.route}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {result.entries.some((e) => e.note) && (
              <ul className="mt-3 space-y-1 text-xs text-brand-900 dark:text-brand-200">
                {result.entries
                  .filter((e) => e.note)
                  .map((e, i) => (
                    <li key={i}>• {e.note}</li>
                  ))}
              </ul>
            )}
            {result.notes && (
              <p className="mt-3 border-t border-brand-200 pt-3 text-xs text-brand-900 dark:border-brand-700 dark:text-brand-200">
                {result.notes}
              </p>
            )}
          </div>
        )}

        {drug.generalNotes && (
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-300">{drug.generalNotes}</p>
        )}
      </div>
    </div>
  );
}
