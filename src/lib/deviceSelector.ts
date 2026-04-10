import { deviceBands } from '../data/devices';
import type { DeviceBand } from '../data/devices';

export type DeviceInput =
  | { kind: 'age'; value: number; unit: 'mesi' | 'anni' }
  | { kind: 'weight'; kg: number }
  | { kind: 'height'; cm: number };

export class DeviceSelectorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeviceSelectorError';
  }
}

/**
 * Trova la fascia appropriata in base a età, peso o altezza.
 * Se il valore è fuori da tutti i range, lancia DeviceSelectorError.
 */
export function findBand(input: DeviceInput): DeviceBand {
  switch (input.kind) {
    case 'age': {
      if (!Number.isFinite(input.value) || input.value < 0) {
        throw new DeviceSelectorError('Età non valida');
      }
      const months = input.unit === 'anni' ? input.value * 12 : input.value;
      const band = deviceBands.find(
        (b) => months >= b.ageMonthsMin && months <= b.ageMonthsMax
      );
      if (!band) {
        throw new DeviceSelectorError(
          "Età fuori dall'intervallo coperto dalle fasce (3 mesi - 12 anni)"
        );
      }
      return band;
    }
    case 'weight': {
      if (!Number.isFinite(input.kg) || input.kg <= 0) {
        throw new DeviceSelectorError('Peso non valido');
      }
      const band = deviceBands.find(
        (b) => input.kg >= b.weightKgMin && input.kg <= b.weightKgMax
      );
      if (!band) {
        throw new DeviceSelectorError(
          "Peso fuori dall'intervallo coperto dalle fasce (5-40 kg)"
        );
      }
      return band;
    }
    case 'height': {
      if (!Number.isFinite(input.cm) || input.cm <= 0) {
        throw new DeviceSelectorError('Altezza non valida');
      }
      const band = deviceBands.find(
        (b) => input.cm >= b.heightCmMin && input.cm <= b.heightCmMax
      );
      if (!band) {
        throw new DeviceSelectorError(
          "Altezza fuori dall'intervallo coperto dalle fasce (50-145 cm)"
        );
      }
      return band;
    }
  }
}
