interface DisclaimerModalProps {
  onClose: () => void;
}

export function DisclaimerModal({ onClose }: DisclaimerModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm dark:bg-slate-950/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      onClick={onClose}
    >
      <div
        className="max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2
            id="disclaimer-title"
            className="text-xl font-semibold text-slate-900 dark:text-slate-100"
          >
            Avviso importante
          </h2>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            <strong>PediCalc</strong> è uno strumento di natura{' '}
            <strong>educativa e formativa</strong>.
          </p>
          <p>
            Questa web app <strong>non sostituisce</strong> la decisione clinica del professionista
            sanitario e rappresenta <strong>solo un supporto al calcolo</strong> dei dosaggi.
          </p>
          <p>
            L'utilizzo dell'app implica piena assunzione di responsabilità professionale da parte
            dell'operatore. I dosaggi proposti vanno sempre verificati con le fonti ufficiali e
            contestualizzati al singolo paziente.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn-primary mt-5 w-full"
          autoFocus
        >
          Ho capito
        </button>
      </div>
    </div>
  );
}
