import { useMemo, useState } from 'react';
import type { View } from '../App';
import { drugs } from '../data/drugs';

interface DrugsPageProps {
  onNavigate: (view: View) => void;
}

export function DrugsPage({ onNavigate }: DrugsPageProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...drugs].sort((a, b) => a.name.localeCompare(b.name, 'it'));
    if (!q) return sorted;
    return sorted.filter((d) => d.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'home' })}
          className="btn-ghost"
        >
          ← Home
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Farmaci</h1>
        <div className="w-16" />
      </div>

      <div className="mb-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca un farmaco..."
          className="input-field"
          autoFocus
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((drug) => (
          <button
            key={drug.id}
            type="button"
            onClick={() => onNavigate({ name: 'drug-detail', drugId: drug.id })}
            className="card flex flex-col items-start text-left transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-slate-900">{drug.name}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {drug.indications.length === 1
                ? drug.indications[0].label
                : `${drug.indications.length} indicazioni`}
            </p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-slate-500">
          Nessun farmaco trovato per "{query}"
        </p>
      )}
    </div>
  );
}
