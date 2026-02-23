import type {
  CarrierBookRequest,
  CarrierBookResponse,
  CarrierQuoteItem,
  CarrierQuoteRequest,
  CarrierListItem,
} from '../../../types';
import type { CarrierAdapter } from './CarrierAdapter';

export class JDLogisticsAdapter implements CarrierAdapter {
  readonly carrierCode = 'JD';
  readonly carrierName = 'JD Logistics (京东物流)';

  getMetadata(): CarrierListItem {
    return {
      carrierCode: this.carrierCode,
      name: this.carrierName,
      services: ['Express', 'Standard'],
      rating: 4.6,
      priceRange: '¥¥',
    };
  }

  async getQuote(shipment: CarrierQuoteRequest): Promise<CarrierQuoteItem> {
    const base = shipment.serviceLevel === 'Express' ? 30 : shipment.serviceLevel === 'Standard' ? 24 : 19;
    const weightFactor = shipment.weight.value * (shipment.weight.unit === 'Kg' ? 1 : shipment.weight.unit === 'Jin' ? 0.5 : 0.001);

    return {
      carrierCode: this.carrierCode,
      price: {
        amount: Number((base + weightFactor * 2.8).toFixed(2)),
        currency: 'CNY',
      },
      estimatedDays: shipment.serviceLevel === 'Express' ? 2 : shipment.serviceLevel === 'Standard' ? 3 : 5,
      serviceLevel: shipment.serviceLevel,
    };
  }

  async book(_shipment: CarrierBookRequest): Promise<CarrierBookResponse> {
    const rand = Math.floor(Math.random() * 1_000_000_000)
      .toString()
      .padStart(10, '0');

    return {
      carrierCode: this.carrierCode,
      trackingNumber: `JD${rand}`,
      bookedAt: new Date().toISOString(),
    };
  }
}
