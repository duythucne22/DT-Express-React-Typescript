import { z } from 'zod';
import { ordersApi } from '../../../api/orders';
import type { CreateOrderRequest, CreateOrderResponse } from '../../../../types';

/**
 * CQRS Command Pattern - CreateOrder
 * 
 * Encapsulates the creation of an order with validation, API call, and store update.
 * Separates the "write" operation from queries.
 * 
 * Example usage:
 * ```typescript
 * const command = new CreateOrderCommand(orderData);
 * const result = await command.execute();
 * ```
 */

// Zod schema for validation
const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

const WeightSchema = z.object({
  value: z.number().positive('Weight must be positive'),
  unit: z.enum(['Kg', 'G', 'Jin', 'Lb']),
});

const DimensionsSchema = z.object({
  lengthCm: z.number().positive(),
  widthCm: z.number().positive(),
  heightCm: z.number().positive(),
}).optional();

const OrderItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  weight: WeightSchema,
  dimensions: DimensionsSchema,
});

const CreateOrderSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  customerPhone: z.string().min(8, 'Phone number must be at least 8 characters'),
  customerEmail: z.string().email('Invalid email').optional(),
  origin: AddressSchema,
  destination: AddressSchema,
  serviceLevel: z.enum(['Express', 'Standard', 'Economy']),
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
});

export class CreateOrderCommand {
  private data: CreateOrderRequest;

  constructor(data: CreateOrderRequest) {
    this.data = data;
  }

  /**
   * Validate the order data using Zod schema
   */
  private validate(): void {
    const result = CreateOrderSchema.safeParse(this.data);
    if (!result.success) {
      const errors = result.error.issues.map((e) => {
        const path = e.path.map(p => String(p)).join('.');
        return `${path}: ${e.message}`;
      }).join(', ');
      throw new Error(`Validation failed: ${errors}`);
    }
  }

  /**
   * Execute the command: validate, call API, update store
   */
  async execute(): Promise<CreateOrderResponse> {
    // Step 1: Validate
    this.validate();

    // Step 2: Call API
    const response = await ordersApi.create(this.data);

    // Step 3: Update store (invalidate cache, let React Query refetch)
    // Note: In React context, the mutation hook handles this.
    // This command is a pure demonstration and can be used standalone.
    return response;
  }

  /**
   * Get the raw data (useful for debugging)
   */
  getData(): CreateOrderRequest {
    return { ...this.data };
  }
}
