import type { View } from '../App';

interface AboutPageProps {
  onNavigate: (view: View) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'home' })}
          className="btn-ghost inline-flex items-center gap-1.5"
        >
          <span aria-hidden="true">←</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
            className="h-4 w-4" aria-hidden="true">
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.432Z" />
          </svg>
          Home
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Chi sono</h1>
        <div className="w-16" />
      </div>

      {/* Card principale */}
      <div className="card">
        {/* Logo + nome */}
        <div className="mb-6 flex items-center gap-4">
          <img
            src="/pwa-192x192.png"
            alt="PediCalc"
            className="h-16 w-16 rounded-2xl shadow-md"
          />
          <div>
            <div className="flex items-center rounded-lg bg-brand-600 px-2.5 py-1 w-fit">
              <span className="text-lg font-bold text-white">Pedi</span>
              <span className="text-lg font-bold text-brand-200">Calc</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Strumento educativo e formativo
            </p>
          </div>
        </div>

        {/* Testo */}
        <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Ciao, sono Niccolò.
          </p>

          <p>
            Sono un infermiere che opera nell'Emergenza Sanitaria di Firenze e Prato dal 2022.
          </p>

          <p>
            PediCalc è nata da una domanda semplice: in emergenza pediatrica, è possibile
            calcolare i dosaggi a mente con un bambino davanti, i familiari che guardano, il
            team che aspetta senza commettere errori? È uno di quei momenti in cui vorresti
            avere qualcosa di affidabile e immediato in tasca.
          </p>

          <p>
            Non sono uno sviluppatore. Ho imparato quello che serviva, trovato gli strumenti
            giusti, e costruito quello che avrei voluto avere io stesso durante il mio lavoro.
          </p>

          <p>
            PediCalc è uno strumento <strong>educativo e formativo</strong>, gratuito, pensato
            da chi lavora sul campo per chi lavora sul campo. Non sostituisce il giudizio
            clinico — lo supporta nei momenti in cui ogni secondo conta.
          </p>
        </div>

        {/* Contatto */}
        <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Contatti
          </p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            Suggerimenti, errori da segnalare o vuoi semplicemente salutare?
          </p>
          <a
            href="mailto:n.ignesti@yahoo.it"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
              className="h-4 w-4" aria-hidden="true">
              <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
              <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
            </svg>
            n.ignesti@yahoo.it
          </a>
        </div>

        {/* Firma */}
        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Niccolò Ignesti
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Infermiere — Emergenza Sanitaria Firenze-Prato
          </p>
        </div>
      </div>
    </div>
  );
}
