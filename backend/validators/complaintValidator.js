const { z } = require('zod');

// Coerce values to numbers and booleans where necessary since multipart/form-data transmits strings
const createComplaintSchema = z.object({
  activityType: z.string().trim().min(1, { message: 'Drug activity type is required' }),
  description: z
    .string()
    .trim()
    .min(1, { message: 'Description is required' })
    .max(1000, { message: 'Description cannot exceed 1000 characters' }),
  district: z.string().trim().min(1, { message: 'District is required' }),
  place: z.string().trim().min(1, { message: 'Place is required' }),
  address: z.string().trim().min(1, { message: 'Address is required' }),
  latitude: z.preprocess(
    (val) => (val === '' || val === undefined ? null : Number(val)),
    z.number().nullable().optional()
  ),
  longitude: z.preprocess(
    (val) => (val === '' || val === undefined ? null : Number(val)),
    z.number().nullable().optional()
  ),
  incidentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid incident date is required'
  }),
  incidentTime: z.string().trim().min(1, { message: 'Incident time is required' }),
  nearestPoliceStation: z.string().trim().optional().default(''),
  isConfidential: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().default(false)
  )
});

const updateStatusSchema = z.object({
  status: z.enum(['Pending', 'Under Investigation', 'Resolved', 'Rejected'], {
    errorMap: () => ({ message: 'Invalid complaint status' })
  }).optional(),
  priority: z.enum(['Low', 'Medium', 'High'], {
    errorMap: () => ({ message: 'Invalid complaint priority' })
  }).optional()
});

const updateNotesSchema = z.object({
  note: z.string().trim().min(1, { message: 'Note content is required' })
});

module.exports = {
  createComplaintSchema,
  updateStatusSchema,
  updateNotesSchema
};
