import type { View } from '../App';

interface HomePageProps {
  onNavigate: (view: View) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          PediCalc
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Supporto al calcolo in emergenza pediatrica
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'drugs' })}
          className="card group flex flex-col items-start text-left transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 transition group-hover:bg-brand-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M11.644 1.59a.75.75 0 0 1 .712 0l9.75 5.25a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l9.75-5.25Z" />
              <path d="m3.265 10.602 7.668 4.129a2.25 2.25 0 0 0 2.134 0l7.668-4.13 1.37.739a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.71 0l-9.75-5.25a.75.75 0 0 1 0-1.32l1.37-.738Z" />
              <path d="m10.933 19.231-7.668-4.13-1.37.739a.75.75 0 0 0 0 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 0 0 0-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 0 1-2.134-.001Z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Farmaci</h2>
          <p className="mt-1 text-sm text-slate-600">
            Calcola i dosaggi pediatrici in base al peso del paziente
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate({ name: 'vital-signs' })}
          className="card group flex flex-col items-start text-left transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-700 transition group-hover:bg-rose-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1 2.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 0 1 2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 0 1 .947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 0 1-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 0 1-2.287-.947ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Parametri vitali</h2>
          <p className="mt-1 text-sm text-slate-600">
            Range di riferimento FR, FC e PA in base all'età
          </p>
        </button>
      </div>
    </div>
  );
}
