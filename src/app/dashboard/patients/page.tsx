import { promises as fs } from "fs"
import path from "path"
import { z } from "zod"

import { columns } from "@/components/patients/columns"
import { DataTable } from "@/components/patients/data-table"
import { patientSchema } from "@/components/patients/schema"
import { Button } from "@/components/ui/button"

// Simulate a database read for patients.
async function getPatients() {
  // In a real app, you would fetch from a database.
  // Here we use mock data.
  const data = await fs.readFile(
    path.join(process.cwd(), "src/lib/data.ts")
  )

  // This is a bit of a hack to extract the patients array from the data file.
  const fileContent = data.toString();
  const patientsArrayString = fileContent.match(/export const patients: Patient\[\] = (\[[\s\S]*?\]);/)?.[1];
  
  if (!patientsArrayString) {
    return [];
  }
  
  // Using eval is generally unsafe, but we are in control of the source file.
  // For a real application, fetching from an API or database is the way to go.
  const patientsData = eval(patientsArrayString);

  return z.array(patientSchema).parse(patientsData)
}

export default async function PatientsPage() {
  const patients = await getPatients()

  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl md:text-4xl">Patients</h1>
                <p className="text-muted-foreground">
                Here's a list of all patients in your clinic.
                </p>
            </div>
            <Button>Add Patient</Button>
        </div>
      
        <DataTable data={patients} columns={columns} />
    </div>
  )
}
