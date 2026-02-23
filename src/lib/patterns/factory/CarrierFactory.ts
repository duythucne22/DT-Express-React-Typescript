import type { CarrierAdapter } from '../adapter/CarrierAdapter';
import { SFExpressAdapter } from '../adapter/SFExpressAdapter';
import { JDLogisticsAdapter } from '../adapter/JDLogisticsAdapter';

export class CarrierFactory {
  static create(code: string): CarrierAdapter {
    const normalized = code.toUpperCase();

    switch (normalized) {
      case 'SF':
        return new SFExpressAdapter();
      case 'JD':
        return new JDLogisticsAdapter();
      default:
        throw new Error(`No carrier adapter found for code '${code}'.`);
    }
  }

  static listAll(): CarrierAdapter[] {
    return [new SFExpressAdapter(), new JDLogisticsAdapter()];
  }
}
