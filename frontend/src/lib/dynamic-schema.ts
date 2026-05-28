import * as z from "zod";
import { CustomField } from "@/types/product";

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
      case "text":
      case "textarea":
        fieldSchema = z.string();
        if (field.required) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.name} is required`);
        } else {
          fieldSchema = fieldSchema.optional().or(z.literal(""));
        }
        break;
      
      case "number":
        fieldSchema = z.number({ invalid_type_error: `${field.name} must be a number` });
        if (!field.required) {
          fieldSchema = fieldSchema.optional();
        }
        break;

      case "checkbox":
        fieldSchema = z.boolean();
        if (!field.required) {
          fieldSchema = fieldSchema.optional();
        }
        break;

      case "dropdown":
        fieldSchema = z.string();
        if (field.required) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.name} is required`);
        } else {
          fieldSchema = fieldSchema.optional().or(z.literal(""));
        }
        break;

      default:
        fieldSchema = z.any();
        if (!field.required) {
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
