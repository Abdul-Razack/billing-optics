import * as z from "zod";
import { CustomField } from "@/types/custom-field";

export function buildDynamicSchema(baseSchema: z.ZodObject<any, any>, customFields: CustomField[]) {
  // If no custom fields, just return the base schema with an optional catch-all record
  if (!customFields || customFields.length === 0) {
    return baseSchema.extend({
      customFields: z.record(z.any()).optional(),
    });
  }

  const customFieldSchemas: Record<string, z.ZodTypeAny> = {};

  for (const field of customFields) {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "TEXT":
      case "TEXTAREA":
        fieldSchema = z.string();
        if (field.isRequired) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.name} is required`);
        } else {
          fieldSchema = fieldSchema.optional().or(z.literal(""));
        }
        break;
      
      case "NUMBER":
        fieldSchema = z.number({ invalid_type_error: `${field.name} must be a number` });
        if (!field.isRequired) {
          fieldSchema = fieldSchema.optional();
        }
        break;

      case "CHECKBOX":
        fieldSchema = z.boolean();
        if (!field.isRequired) {
          fieldSchema = fieldSchema.optional();
        }
        break;

      case "DROPDOWN":
        fieldSchema = z.string();
        if (field.isRequired) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.name} is required`);
        } else {
          fieldSchema = fieldSchema.optional().or(z.literal(""));
        }
        break;

      default:
        fieldSchema = z.any();
        if (!field.isRequired) {
          fieldSchema = fieldSchema.optional();
        }
    }

    customFieldSchemas[field.id] = fieldSchema;
  }

  // Extend the base schema
  return baseSchema.extend({
    customFields: z.object(customFieldSchemas).optional()
  });
}
