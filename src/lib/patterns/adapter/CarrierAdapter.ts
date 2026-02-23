import type {
  CarrierBookRequest,
  CarrierBookResponse,
  CarrierListItem,
  CarrierQuoteItem,
  CarrierQuoteRequest,
} from '../../../types';

export interface CarrierAdapter {
  readonly carrierCode: string;
  readonly carrierName: string;

  getMetadata(): CarrierListItem;
  getQuote(shipment: CarrierQuoteRequest): Promise<CarrierQuoteItem>;
  book(shipment: CarrierBookRequest): Promise<CarrierBookResponse>;
}
