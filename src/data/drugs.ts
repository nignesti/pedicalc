/**
 * Database dei farmaci.
 *
 * IMPORTANTE: questo è l'unico posto in cui modificare dosaggi, regole e note.
 * Tutte le modifiche a questo file dovrebbero essere accompagnate da test
 * aggiornati in src/lib/__tests__/ se introducono nuovi tipi di regole.
 *
 * Ogni farmaco ha una o più `indications` con relative `DosageRule`.
 * Il motore di calcolo (src/lib/calculator.ts) è generico e sa gestire
 * qualsiasi regola definita nel tipo DosageRule.
 */

import type { Drug } from '../types/drug';

export const drugs: Drug[] = [
  {
    id: 'adenosina',
    name: 'Adenosina',
    category: 'farmaco',
    indications: [
      {
        id: 'prima-dose',
        label: '1ª dose',
        description: 'Tachicardie parossistiche sopraventricolari',
        rule: {
          kind: 'weight-based',
          factor: 0.1,
          unit: 'mg',
          route: 'EV',
          maxDose: 6,
          decimals: 2,
          notes: 'Somministrare EV rapido, seguito da flush di soluzione fisiologica.',
        },
      },
      {
        id: 'seconda-dose',
        label: '2ª dose',
        description: 'Se la prima dose è stata inefficace',
        rule: {
          kind: 'weight-based',
          factor: 0.2,
          unit: 'mg',
          route: 'EV',
          maxDose: 12,
          decimals: 2,
          notes: 'Somministrare EV rapido, seguito da flush di soluzione fisiologica.',
        },
      },
    ],
  },

  {
    id: 'adrenalina',
    name: 'Adrenalina',
    category: 'farmaco',
    indications: [
      {
        id: 'acr',
        label: 'ACR',
        description: 'Arresto cardio-respiratorio',
        rule: {
          kind: 'weight-based',
          factor: 0.01,
          unit: 'mg',
          route: 'EV/IO',
          maxDose: 1,
          decimals: 2,
          notes: 'Ripetere ogni 3-5 minuti durante la rianimazione.',
        },
      },
      {
        id: 'anafilassi',
        label: 'Anafilassi',
        description: 'Shock anafilattico (via IM)',
        rule: {
          kind: 'weight-based',
          factor: 0.01,
          unit: 'mg',
          route: 'IM',
          maxDose: 0.5,
          decimals: 2,
          notes: 'Ripetibile dopo 5-15 minuti se necessario.',
        },
      },
      {
        id: 'croup',
        label: 'Croup',
        description: 'Laringite stridula - aerosol',
        rule: {
          kind: 'weight-based',
          factor: 0.2,
          unit: 'mg',
          route: 'Aerosol',
          maxDose: 5,
          decimals: 2,
          notes:
            'Diluire con 3 mL di soluzione fisiologica. Monitorare per 2-3 ore dopo la somministrazione.',
        },
      },
    ],
  },

  {
    id: 'amiodarone',
    name: 'Amiodarone',
    category: 'farmaco',
    indications: [
      {
        id: 'default',
        label: 'FV/TV senza polso',
        description: 'Refrattaria alla defibrillazione - tachiaritmie ventricolari',
        rule: {
          kind: 'weight-based',
          factor: 5,
          unit: 'mg',
          route: 'EV',
          decimals: 0,
          notes:
            'Somministrare lentamente (20-60 minuti), eccetto in arresto cardiaco (bolo rapido).',
        },
      },
    ],
  },

  {
    id: 'atropina',
    name: 'Atropina',
    category: 'farmaco',
    indications: [
      {
        id: 'default',
        label: 'Bradicardia sintomatica',
        description: 'Anche per avvelenamento da organofosforici',
        rule: {
          kind: 'weight-based',
          factor: 0.02,
          unit: 'mg',
          route: 'EV',
          minDose: 0.1,
          maxDose: 0.5,
          decimals: 2,
        },
      },
    ],
  },

  {
    id: 'breva-clenil',
    name: 'Breva + Clenil',
    category: 'farmaco',
    indications: [
      {
        id: 'aerosol',
        label: 'Breva (gocce)',
        description: 'Asma, broncospasmo, laringospasmo - aerosol',
        rule: {
          kind: 'weight-band',
          bands: [
            { minKg: 5, maxKg: 6, value: 2 },
            { minKg: 6.01, maxKg: 8, value: 3 },
            { minKg: 8.01, maxKg: 10, value: 4 },
            { minKg: 10.01, maxKg: 12, value: 5 },
            { minKg: 12.01, maxKg: 17, displayValue: '6-8' },
            { minKg: 17.01, maxKg: 23, value: 8 },
            { minKg: 23.01, maxKg: 29, value: 10 },
            { minKg: 29.01, maxKg: 40, displayValue: '12-14' },
            { minKg: 40.01, displayValue: '14 (max)' },
          ],
          unit: 'gocce',
          route: 'Aerosol',
          decimals: 0,
          notes: 'Abbinare sempre Clenil 1/2 fiala. Diluire in 2-3 mL di soluzione fisiologica.',
        },
      },
    ],
  },

  {
    id: 'diazepam',
    name: 'Diazepam',
    category: 'farmaco',
    indications: [
      {
        id: 'convulsioni',
        label: 'Crisi convulsive',
        description: 'Stato di male epilettico',
        rule: {
          kind: 'weight-based',
          factor: 0.2,
          unit: 'mg',
          route: 'EV/Rettale',
          maxDose: 10,
          decimals: 2,
          notes:
            'Somministrare lentamente. Monitorare la respirazione — rischio di depressione respiratoria.',
        },
      },
    ],
  },

  {
    id: 'elettricita',
    name: 'Elettricità',
    category: 'elettricita',
    indications: [
      {
        id: 'defibrillazione',
        label: 'Defibrillazione',
        description: 'FV / TV senza polso — scarica non sincronizzata',
        rule: {
          kind: 'shock',
          unit: 'J',
          shocks: [
            { label: '1ª scarica', factorMin: 2 },
            { label: '2ª scarica', factorMin: 4 },
            { label: '3ª scarica', factorMin: 6 },
            { label: '4ª scarica', factorMin: 8 },
            { label: '5ª scarica', factorMin: 10 },
          ],
          notes: 'Dose iniziale 2 J/kg, successive 4 J/kg fino a 10 J/kg.',
        },
      },
      {
        id: 'cardioversione',
        label: 'Cardioversione',
        description: 'Tachiaritmia con polso — scarica sincronizzata',
        rule: {
          kind: 'shock',
          unit: 'J',
          shocks: [
            { label: '1ª scarica', factorMin: 0.5, factorMax: 1 },
            { label: '2ª scarica (se inefficace)', factorMin: 2 },
          ],
        },
      },
    ],
  },

  {
    id: 'fentanile',
    name: 'Fentanile',
    category: 'farmaco',
    indications: [
      {
        id: 'default',
        label: 'Analgesia / sedazione procedurale',
        rule: {
          kind: 'weight-based',
          factor: 1,
          unit: 'mcg',
          route: 'EV/IO',
          decimals: 1,
          notes:
            'Somministrare lentamente. Rischio di depressione respiratoria e rigidità toracica.',
        },
      },
    ],
  },

  {
    id: 'glucagone',
    name: 'Glucagone',
    category: 'farmaco',
    indications: [
      {
        id: 'default',
        label: 'Ipoglicemia grave',
        description: 'Senza accesso venoso disponibile',
        rule: {
          kind: 'weight-band',
          bands: [
            { minKg: 5, maxKg: 24, value: 0.5 },
            { minKg: 25, value: 1 },
          ],
          unit: 'mg',
          route: 'IM',
          decimals: 1,
          outOfBandsMessage: 'Peso < 5 kg: consultare medico per dosaggio.',
        },
      },
    ],
  },

  {
    id: 'idrocortisone',
    name: 'Idrocortisone',
    category: 'farmaco',
    indications: [
      {
        id: 'default',
        label: 'Asma grave / anafilassi / insufficienza surrenalica',
        rule: {
          kind: 'weight-based',
          factor: 5,
          unit: 'mg',
          route: 'EV/IM',
          maxDose: 200,
          decimals: 0,
        },
      },
    ],
  },

  {
    id: 'ketamina',
    name: 'Ketamina',
    category: 'farmaco',
    indications: [
      {
        id: 'analgesia',
        label: 'Analgesia',
        description: 'Basse dosi',
        rule: {
          kind: 'weight-range',
          factorMin: 0.2,
          factorMax: 0.5,
          unit: 'mg',
          route: 'EV',
          decimals: 1,
        },
        routeVariants: [
          {
            id: 'ev',
            label: 'EV',
            rule: {
              kind: 'weight-range',
              factorMin: 0.2,
              factorMax: 0.5,
              unit: 'mg',
              route: 'EV',
              decimals: 1,
            },
          },
          {
            id: 'im',
            label: 'IM',
            rule: {
              kind: 'weight-range',
              factorMin: 0.5,
              factorMax: 1,
              unit: 'mg',
              route: 'IM',
              decimals: 1,
            },
          },
        ],
      },
      {
        id: 'sedazione',
        label: 'Sedazione',
        description: 'Dose dissociativa',
        rule: {
          kind: 'weight-range',
          factorMin: 1,
          factorMax: 2,
          unit: 'mg',
          route: 'EV',
          decimals: 1,
        },
      },
    ],
  },

  {
    id: 'lidocaina',
    name: 'Lidocaina',
    category: 'farmaco',
    indications: [
      {
        id: 'default',
        label: 'Sedazione procedurale / anestesia locale',
        rule: {
          kind: 'weight-based',
          factor: 1,
          unit: 'mg',
          route: 'EV',
          decimals: 1,
          notes: 'Fiala standard 10 mg/mL (1%).',
        },
      },
    ],
  },

  {
    id: 'liquidi',
    name: 'Liquidi',
    category: 'liquidi',
    indications: [
      {
        id: 'default',
        label: 'Reintegro volemico',
        rule: {
          kind: 'weight-based',
          factor: 20,
          unit: 'mL',
          route: 'EV',
          decimals: 0,
          notes: 'Bolo di 20 mL/kg. Rivalutare clinicamente dopo ogni bolo.',
        },
      },
    ],
  },

  {
    id: 'metilprednisolone',
    name: 'Metilprednisolone',
    category: 'farmaco',
    generalNotes: 'Somministrare EV. La dose può essere ripetuta.',
    indications: [
      {
        id: 'default',
        label: 'Asma grave / anafilassi / insufficienza surrenalica',
        rule: {
          kind: 'weight-age',
          bands: [
            { maxAgeYears: 2, factor: 2, maxDose: 20, label: '≤ 2 anni' },
            { maxAgeYears: 5, factor: 2, maxDose: 30, label: '3-5 anni' },
            { maxAgeYears: 11, factor: 2, maxDose: 40, label: '6-11 anni' },
            { maxAgeYears: Infinity, factor: 1, maxDose: 50, label: '≥ 12 anni' },
          ],
          unit: 'mg',
          route: 'EV',
          decimals: 0,
        },
      },
    ],
  },

  {
    id: 'midazolam',
    name: 'Midazolam',
    category: 'farmaco',
    indications: [
      {
        id: 'convulsioni',
        label: 'Convulsioni',
        description: 'Stato di male epilettico',
        rule: {
          kind: 'weight-based',
          factor: 0.1,
          unit: 'mg',
          route: 'EV',
          maxDose: 2,
          decimals: 2,
        },
        routeVariants: [
          {
            id: 'ev',
            label: 'EV',
            rule: {
              kind: 'weight-based',
              factor: 0.1,
              unit: 'mg',
              route: 'EV',
              maxDose: 2,
              decimals: 2,
            },
          },
          {
            id: 'im',
            label: 'IM',
            rule: {
              kind: 'weight-based',
              factor: 0.2,
              unit: 'mg',
              route: 'IM',
              maxDose: 10,
              decimals: 2,
            },
          },
          {
            id: 'in',
            label: 'IN',
            rule: {
              kind: 'weight-based',
              factor: 0.4,
              unit: 'mg',
              route: 'IN',
              maxDose: 10,
              decimals: 2,
              notes: 'Dividere la dose in metà per ciascuna narice.',
            },
          },
        ],
      },
      {
        id: 'sedazione',
        label: 'Sedazione',
        description: 'Sedazione procedurale',
        rule: {
          kind: 'weight-range',
          factorMin: 0.1,
          factorMax: 0.2,
          unit: 'mg',
          route: 'EV/IM',
          maxDose: 10,
          decimals: 2,
        },
        routeVariants: [
          {
            id: 'ev-im',
            label: 'EV/IM',
            rule: {
              kind: 'weight-range',
              factorMin: 0.1,
              factorMax: 0.2,
              unit: 'mg',
              route: 'EV/IM',
              maxDose: 10,
              decimals: 2,
            },
          },
          {
            id: 'in',
            label: 'IN',
            rule: {
              kind: 'weight-range',
              factorMin: 0.2,
              factorMax: 0.5,
              unit: 'mg',
              route: 'IN',
              maxDose: 10,
              decimals: 2,
              notes: 'Dividere la dose in metà per ciascuna narice.',
            },
          },
        ],
      },
    ],
  },

  {
    id: 'morfina',
    name: 'Morfina',
    category: 'farmaco',
    indications: [
      {
        id: 'default',
        label: 'Dolore moderato-severo',
        rule: {
          kind: 'weight-based',
          factor: 0.1,
          unit: 'mg',
          route: 'EV',
          decimals: 2,
          notes: 'Somministrare lentamente. Rischio di depressione respiratoria.',
        },
      },
    ],
  },

  {
    id: 'naloxone',
    name: 'Naloxone',
    category: 'farmaco',
    indications: [
      {
        id: 'default',
        label: 'Antidoto oppioidi',
        description: 'Depressione respiratoria da oppioidi',
        rule: {
          kind: 'weight-based',
          factor: 0.1,
          unit: 'mg',
          route: 'IM/IN/EV',
          maxDose: 0.4,
          decimals: 2,
          notes:
            'Fiala standard 0.4 mg. Ripetibile ogni 2-3 minuti fino a risoluzione della sintomatologia.',
        },
      },
    ],
  },

  {
    id: 'paracetamolo',
    name: 'Paracetamolo EV',
    category: 'farmaco',
    indications: [
      {
        id: 'default',
        label: 'Dolore e febbre',
        rule: {
          kind: 'weight-band',
          bands: [
            { minKg: 0.1, maxKg: 9.99, displayValue: '7.5 mg/kg' },
            { minKg: 10, displayValue: '15 mg/kg' },
          ],
          unit: 'mg',
          route: 'EV',
          notes:
            'Non superare la dose massima giornaliera. Intervallo minimo 6 ore tra le somministrazioni.',
        },
      },
    ],
  },

  {
    id: 'rocuronio',
    name: 'Rocuronio',
    category: 'farmaco',
    indications: [
      {
        id: 'default',
        label: 'Intubazione a sequenza rapida (RSI)',
        description: 'Blocco neuromuscolare',
        rule: {
          kind: 'weight-range',
          factorMin: 0.6,
          factorMax: 1.2,
          unit: 'mg',
          route: 'EV',
          decimals: 1,
          notes: 'Tempo per curarizzazione: 60-70 secondi.',
        },
      },
    ],
  },

  {
    id: 'succinilcolina',
    name: 'Succinilcolina',
    category: 'farmaco',
    indications: [
      {
        id: 'default',
        label: 'Intubazione a sequenza rapida (RSI)',
        description: 'Blocco neuromuscolare a breve durata',
        rule: {
          kind: 'weight-range',
          factorMin: 1,
          factorMax: 2,
          unit: 'mg',
          route: 'EV',
          decimals: 1,
          notes: 'Insorgenza 30-60 secondi. Durata d\'azione 5-10 minuti.',
        },
      },
    ],
  },
];

/** Restituisce un farmaco per id, o undefined se non esiste. */
export function getDrugById(id: string): Drug | undefined {
  return drugs.find((d) => d.id === id);
}
