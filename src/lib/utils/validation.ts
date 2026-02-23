import { z } from 'zod/v4';

const addressSchema = z.object({
  street: z.string().min(2, 'Street is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

const dimensionsSchema = z.object({
  lengthCm: z.number().positive('Length must be > 0'),
  widthCm: z.number().positive('Width must be > 0'),
  heightCm: z.number().positive('Height must be > 0'),
});

export const customerStepSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().regex(/^1[3-9]\d{9}$/, 'Phone must be valid Chinese mobile format'),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
});

export const addressesStepSchema = z.object({
  origin: addressSchema,
  destination: addressSchema,
});

export const itemSchema = z.object({
  description: z.string().min(2, 'Description is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  weight: z.object({
    value: z.number().positive('Weight must be > 0'),
    unit: z.enum(['Kg', 'G', 'Jin', 'Lb']),
  }),
  dimensions: z.union([dimensionsSchema, z.null()]),
});

export const itemsStepSchema = z.object({
  items: z.array(itemSchema).min(1, 'At least one item is required'),
});

export const reviewStepSchema = z.object({
  serviceLevel: z.enum(['Express', 'Standard', 'Economy']),
});

export const createOrderSchema = customerStepSchema
  .and(addressesStepSchema)
  .and(itemsStepSchema)
  .and(reviewStepSchema);

export type ValidationErrors = Record<string, string>;

export function zodErrorToFieldMap(error: z.ZodError): ValidationErrors {
  const result: ValidationErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}
