/**
 * Dati dispositivi per fascia pediatrica (PediCard 118).
 * Ogni fascia è definita da range di età (mesi), peso (kg), altezza (cm).
 * Fonte: PediCard 118 (non citata nell'UI).
 */

export type FasciaColor = 'rosso' | 'giallo' | 'verde' | 'arancione' | 'viola' | 'bianco';

export interface DeviceSet {
  cannulaOrofaringea: string;
  sondaAspirazione: string;
  lamaLaringoscopio: string;
  tuboEndotracheale: string;
  tuboLaringeo: string;
  palloneAutoespansibile: string;
  mascheraVentilazione: string;
  cvp: string;
  io: string;
  /** Siti di inserzione IO (in ordine di preferenza). */
  ioSiti: string;
  sng: string;
  cv: string;
}

export interface DeviceBand {
  id: FasciaColor;
  label: string;
  ageLabel: string;
  weightLabel: string;
  heightLabel: string;
  /** Range età in mesi, estremi inclusi */
  ageMonthsMin: number;
  ageMonthsMax: number;
  /** Range peso in kg, estremi inclusi */
  weightKgMin: number;
  weightKgMax: number;
  /** Range altezza in cm, estremi inclusi */
  heightCmMin: number;
  heightCmMax: number;
  devices: DeviceSet;
}

export const deviceBands: DeviceBand[] = [
  {
    id: 'rosso',
    label: 'Rosso',
    ageLabel: '3-11 mesi',
    weightLabel: '5-8 kg',
    heightLabel: '50-70 cm',
    ageMonthsMin: 3,
    ageMonthsMax: 11,
    weightKgMin: 5,
    weightKgMax: 8,
    heightCmMin: 50,
    heightCmMax: 70,
    devices: {
      cannulaOrofaringea: '40-50 mm',
      sondaAspirazione: '8 Fr',
      lamaLaringoscopio: '2 Retta',
      tuboEndotracheale: '3,5-4 (profondità 10,5-12 cm)',
      tuboLaringeo: '0',
      palloneAutoespansibile: '1 Litro',
      mascheraVentilazione: '0-1',
      cvp: '22-24 G',
      io: '15 G - 15 mm (Rosa)',
      ioSiti: 'Tibia prossimale · Femore distale',
      sng: '8 Fr',
      cv: '8 Fr',
    },
  },
  {
    id: 'giallo',
    label: 'Giallo',
    ageLabel: '1-2 anni',
    weightLabel: '9-14 kg',
    heightLabel: '71-94 cm',
    ageMonthsMin: 12,
    ageMonthsMax: 35,
    weightKgMin: 9,
    weightKgMax: 14,
    heightCmMin: 71,
    heightCmMax: 94,
    devices: {
      cannulaOrofaringea: '50 mm',
      sondaAspirazione: '10 Fr',
      lamaLaringoscopio: '2 Curva',
      tuboEndotracheale: '4 (profondità 12 cm)',
      tuboLaringeo: '1',
      palloneAutoespansibile: '1 Litro',
      mascheraVentilazione: '2',
      cvp: '22-24 G',
      io: '15 G - 15 mm (Rosa)',
      ioSiti: 'Tibia prossimale · Femore distale',
      sng: '10 Fr',
      cv: '10 Fr',
    },
  },
  {
    id: 'verde',
    label: 'Verde',
    ageLabel: '3-4 anni',
    weightLabel: '15-17 kg',
    heightLabel: '95-107 cm',
    ageMonthsMin: 36,
    ageMonthsMax: 59,
    weightKgMin: 15,
    weightKgMax: 17,
    heightCmMin: 95,
    heightCmMax: 107,
    devices: {
      cannulaOrofaringea: '60 mm',
      sondaAspirazione: '10 Fr',
      lamaLaringoscopio: '2 Curva',
      tuboEndotracheale: '4,5-5 (profondità 13,5-15 cm)',
      tuboLaringeo: '2',
      palloneAutoespansibile: '1 Litro',
      mascheraVentilazione: '2',
      cvp: '18-22 G',
      io: '15 G - 15 mm (Rosa)',
      ioSiti: 'Tibia prossimale · Femore distale',
      sng: '10 Fr',
      cv: '10 Fr',
    },
  },
  {
    id: 'arancione',
    label: 'Arancione',
    ageLabel: '5-7 anni',
    weightLabel: '18-23 kg',
    heightLabel: '108-120 cm',
    ageMonthsMin: 60,
    ageMonthsMax: 95,
    weightKgMin: 18,
    weightKgMax: 23,
    heightCmMin: 108,
    heightCmMax: 120,
    devices: {
      cannulaOrofaringea: '70 mm',
      sondaAspirazione: '10 Fr',
      lamaLaringoscopio: '3 Curva',
      tuboEndotracheale: '6 (profondità 18 cm)',
      tuboLaringeo: '2',
      palloneAutoespansibile: '1-2 Litri',
      mascheraVentilazione: '2',
      cvp: '18-20 G',
      io: '15 G - 15 mm (Rosa)',
      ioSiti: 'Tibia prossimale · Femore distale · Tibia distale',
      sng: '14 Fr',
      cv: '12 Fr',
    },
  },
  {
    id: 'viola',
    label: 'Viola',
    ageLabel: '8-9 anni',
    weightLabel: '24-29 kg',
    heightLabel: '121-132 cm',
    ageMonthsMin: 96,
    ageMonthsMax: 119,
    weightKgMin: 24,
    weightKgMax: 29,
    heightCmMin: 121,
    heightCmMax: 132,
    devices: {
      cannulaOrofaringea: '80 mm',
      sondaAspirazione: '10 Fr',
      lamaLaringoscopio: '3 Curva',
      tuboEndotracheale: '6 (profondità 18 cm)',
      tuboLaringeo: '2',
      palloneAutoespansibile: '2 Litri',
      mascheraVentilazione: '2',
      cvp: '18-20 G',
      io: '15 G - 15 mm (Rosa)',
      ioSiti: 'Tibia prossimale · Femore distale · Tibia distale',
      sng: '14 Fr',
      cv: '12 Fr',
    },
  },
  {
    id: 'bianco',
    label: 'Bianco',
    ageLabel: '10-12 anni',
    weightLabel: '30-40 kg',
    heightLabel: '133-145 cm',
    ageMonthsMin: 120,
    ageMonthsMax: 155,
    weightKgMin: 30,
    weightKgMax: 40,
    heightCmMin: 133,
    heightCmMax: 145,
    devices: {
      cannulaOrofaringea: '80 mm',
      sondaAspirazione: '10 Fr',
      lamaLaringoscopio: '3 Curva',
      tuboEndotracheale: '6 (profondità 18 cm)',
      tuboLaringeo: '3',
      palloneAutoespansibile: '2 Litri',
      mascheraVentilazione: '3',
      cvp: '16-18-20 G',
      io: '15 G - 15 mm (Rosa)',
      ioSiti: 'Tibia prossimale · Femore distale · Tibia distale',
      sng: '18 Fr',
      cv: '12 Fr',
    },
  },
];
