/**
 * Chip compatta che mostra peso (e opzionalmente età) del paziente attivo.
 * Visibile negli header delle pagine interne come promemoria contestuale.
 * Ritorna null se nessun peso è impostato.
 */

import { usePatient } from '../context/PatientContext';

export function PatientChip() {
  const { weight, age, ageUnit } = usePatient();

  const weightNum = parseFloat(weight);
  if (!Number.isFinite(weightNum) || weightNum <= 0) return null;

  const ageNum = parseFloat(age);
  const hasAge = age !== '' && Number.isFinite(ageNum) && ageNum > 0;

  const ageLabel = hasAge
    ? ` · ${ageNum}\u00a0${ageUnit === 'mesi' ? 'mesi' : ageNum === 1 ? 'anno' : 'anni'}`
    : '';

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-3 w-3 flex-shrink-0"
        aria-hidden="true"
      >
        <path d="M12 2.25a.75.75 0 0 1 .75.75v.756a49.106 49.106 0 0 1 9.152 1 .75.75 0 0 1-.152 1.485h-1.918l2.474 10.124a.75.75 0 0 1-.375.84A6.723 6.723 0 0 1 18.75 18a6.723 6.723 0 0 1-3.181-.795.75.75 0 0 1-.375-.84l2.474-10.124H12.75v13.28c1.293.076 2.534.343 3.697.776a.75.75 0 0 1-.262 1.453h-8.37a.75.75 0 0 1-.262-1.453c1.162-.433 2.404-.7 3.697-.775V6.24H6.332l2.474 10.124a.75.75 0 0 1-.375.84A6.723 6.723 0 0 1 5.25 18a6.723 6.723 0 0 1-3.181-.795.75.75 0 0 1-.375-.84L4.168 6.241H2.25a.75.75 0 0 1-.152-1.485 49.105 49.105 0 0 1 9.152-1V3a.75.75 0 0 1 .75-.75Z" />
      </svg>
      {weightNum}\u00a0kg{ageLabel}
    </span>
  );
}
