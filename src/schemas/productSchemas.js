const { z } = require('zod');

const createProductSchema = z
  .object({
    sku: z
      .string({ error: 'El sku es obligatorio y debe ser texto' })
      .trim()
      .toUpperCase()
      .min(3, 'El sku debe tener al menos 3 caracteres')
      .max(50, 'El sku no puede tener más de 50 caracteres')
      .regex(/^[A-Z0-9-]+$/, 'El sku solo puede tener letras, números y guiones'),
    name: z
      .string({ error: 'El nombre es obligatorio y debe ser texto' })
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(150, 'El nombre no puede tener más de 150 caracteres'),
    description: z
      .string({ error: 'La descripción debe ser texto' })
      .trim()
      .max(1000, 'La descripción no puede tener más de 1000 caracteres')
      .optional(),
    price: z
      .number({ error: 'El precio es obligatorio y debe ser un número' })
      .positive('El precio debe ser mayor a 0')
      .max(99999999.99, 'El precio es demasiado alto'),
    stock: z
      .number({ error: 'El stock debe ser un número' })
      .int('El stock debe ser un número entero')
      .min(0, 'El stock no puede ser negativo')
      .optional(),
    category_id: z
      .number({ error: 'El category_id es obligatorio y debe ser un número' })
      .int('El category_id debe ser un número entero')
      .positive('El category_id debe ser positivo'),
  })
  .strict();

const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envía al menos un campo para actualizar',
  });

module.exports = { createProductSchema, updateProductSchema };