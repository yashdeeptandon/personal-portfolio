import { testimonialCreateSchema, testimonialUpdateSchema } from "./schemas";

export const testimonialValidation = {
  create: testimonialCreateSchema,
  update: testimonialUpdateSchema,
};
