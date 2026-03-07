import { z } from 'zod';

export interface FindBestWordInput {
  rack: string;
  word?: string;
}

const rackField = z.preprocess(
  (value: unknown) => (typeof value === 'string' ? value.trim() : value),
  z
    .string({
      required_error: 'Rack is required and must be a string',
      invalid_type_error: 'Rack is required and must be a string',
    })
    .min(1, 'Rack must contain 1-7 letters')
    .max(7, 'Rack must contain 1-7 letters')
    .regex(/^[A-Za-z]+$/, 'Rack must contain only letters A-Z')
    .transform((value: string) => value.toUpperCase())
);

const boardWordField = z.preprocess(
  (value: unknown) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  },
  z
    .string({
      invalid_type_error: 'Word must be a string',
    })
    .regex(/^[A-Za-z]+$/, 'Word must contain only letters A-Z')
    .transform((value: string) => value.toUpperCase())
    .optional()
);

export const findBestWordInputSchema = z
  .object({
    rack: rackField,
    word: boardWordField,
  })
  .strict();
