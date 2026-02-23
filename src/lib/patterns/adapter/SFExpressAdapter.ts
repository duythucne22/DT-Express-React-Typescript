import type {
  CarrierBookRequest,
  CarrierBookResponse,
  CarrierQuoteItem,
  CarrierQuoteRequest,
  CarrierListItem,
} from '../../../types';
import type { CarrierAdapter } from './CarrierAdapter';

export class SFExpressAdapter implements CarrierAdapter {
  readonly carrierCode = 'SF';
  readonly carrierName = 'SF Express (顺丰速运)';

  getMetadata(): CarrierListItem {
    return {
      carrierCode: this.carrierCode,
      name: this.carrierName,
      services: ['Express', 'Standard', 'Economy'],
      rating: 4.8,
      priceRange: '¥¥¥',
    };
  }

  async getQuote(shipment: CarrierQuoteRequest): Promise<CarrierQuoteItem> {
    const base = shipment.serviceLevel === 'Express' ? 35 : shipment.serviceLevel === 'Standard' ? 28 : 20;
    const weightFactor = shipment.weight.value * (shipment.weight.unit === 'Kg' ? 1 : shipment.weight.unit === 'Jin' ? 0.5 : 0.001);

    return {
      carrierCode: this.carrierCode,
      price: {
        amount: Number((base + weightFactor * 3.2).toFixed(2)),
        currency: 'CNY',
      },
      estimatedDays: shipment.serviceLevel === 'Express' ? 1 : shipment.serviceLevel === 'Standard' ? 2 : 4,
      serviceLevel: shipment.serviceLevel,
    };
  }

  async book(_shipment: CarrierBookRequest): Promise<CarrierBookResponse> {
    const rand = Math.floor(Math.random() * 1_000_000_000)
      .toString()
      .padStart(10, '0');

    return {
      carrierCode: this.carrierCode,
      trackingNumber: `SF${rand}`,
      bookedAt: new Date().toISOString(),
    };
  }
}
