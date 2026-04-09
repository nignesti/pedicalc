import { useMemo, useState } from 'react';
import type { View } from '../App';
import { getDrugById } from '../data/drugs';
import { calculate, CalculationError } from '../lib/calculator';
import type { CalculationResult } from '../lib/calculator';
import type { DosageRule, Indication } from '../types/drug';

interface DrugDetailPageProps {
  drugId: string;
  onNavigate: (view: View) => void;
}

export function DrugDetailPage({ drugId, onNavigate }: DrugDetailPageProps) {
  const drug = getDrugById(drugId);

  const [indicationId, setIndicationId] = useState<string>(
    drug?.indications[0]?.id ?? ''
  );
  const [routeVariantId, setRouteVariantId] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');

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
        <p className="text-slate-600">Farmaco non trovato.</p>
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
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'drugs' })}
          className="btn-ghost"
        >
          ← Farmaci
        </button>
        <button
          type="button"
          onClick={() => onNavigate({ name: 'home' })}
          className="btn-ghost"
        >
          Home
        </button>
      </div>

      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900">{drug.name}</h1>

        {/* Selettore indicazione se ce n'è più di una */}
        {drug.indications.length > 1 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Indicazione
            </p>
            <div className="flex flex-wrap gap-2">
              {drug.indications.map((ind) => (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => {
                    setIndicationId(ind.id);
                    setRouteVariantId(null);
                  }}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    indicationId === ind.id
                      ? 'pill-selected'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50'
                  }`}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentIndication?.description && (
          <p className="mt-3 text-sm text-slate-600">{currentIndication.description}</p>
        )}

        {/* Selettore via di somministrazione */}
        {currentIndication?.routeVariants && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50'
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
            <label htmlFor="weight" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
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
          </div>
          {needsAge && (
            <div>
              <label htmlFor="age" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
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
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-2xl border-2 border-brand-200 bg-brand-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Dose calcolata
            </p>
            <div className="mt-3 space-y-3">
              {result.entries.map((entry, idx) => (
                <div key={idx} className="flex items-baseline gap-3">
                  {entry.label && (
                    <span className="text-sm font-medium text-slate-600">
                      {entry.label}:
                    </span>
                  )}
                  <span className="text-3xl font-bold text-brand-800">
                    {entry.value}
                  </span>
                  <span className="text-lg font-medium text-brand-700">
                    {entry.unit}
                  </span>
                  {entry.route && (
                    <span className="rounded-md bg-brand-200/60 px-2 py-0.5 text-xs font-semibold text-brand-800">
                      {entry.route}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {result.entries.some((e) => e.note) && (
              <ul className="mt-3 space-y-1 text-xs text-brand-900/80">
                {result.entries
                  .filter((e) => e.note)
                  .map((e, i) => (
                    <li key={i}>• {e.note}</li>
                  ))}
              </ul>
            )}
            {result.notes && (
              <p className="mt-3 border-t border-brand-200/60 pt-3 text-xs text-brand-900/80">
                {result.notes}
              </p>
            )}
          </div>
        )}

        {drug.generalNotes && (
          <p className="mt-4 text-xs text-slate-500">{drug.generalNotes}</p>
        )}
      </div>
    </div>
  );
}
