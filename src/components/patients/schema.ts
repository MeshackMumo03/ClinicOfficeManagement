import { z } from "zod"

// We're keeping a simple schema here.
// You can add more fields as needed.
export const patientSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  age: z.number(),
  gender: z.enum(["Male", "Female", "Other"]),
  lastVisit: z.string(),
  status: z.enum(["Active", "Inactive"]),
})

export type Patient = z.infer<typeof patientSchema>
