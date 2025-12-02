'use client';

// Import necessary components and utilities.
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Define the type for a patient.
type Patient = {
  id: string;
  firstName: string;
  lastName: string;
};

// Define the props for the PatientList component.
interface PatientListProps {
  patients: Patient[];
  selectedPatientId?: string;
  onSelectPatient: (id: string) => void;
}

/**
 * PatientList component to display a searchable list of patients.
 * @param {PatientListProps} props - The properties for the component.
 */
export function PatientList({ patients, selectedPatientId, onSelectPatient }: PatientListProps) {
  return (
    <div className="border rounded-lg bg-card text-card-foreground">
      {/* Search input for filtering patients. */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search patients..." className="pl-8 w-full" />
        </div>
      </div>
      <div className="divide-y">
        {/* Header for the patient list. */}
        <div className="grid grid-cols-1 p-4 font-medium text-muted-foreground">
          <div>Name</div>
        </div>
        {/* Scrollable area for the list of patients. */}
        <div className="max-h-[600px] overflow-y-auto">
        {patients.map(patient => (
          // Link to the patient's profile page.
          <div
            key={patient.id}
            onClick={() => onSelectPatient(patient.id)}
            className={cn(
              "grid grid-cols-1 p-4 cursor-pointer hover:bg-muted/50",
              patient.id === selectedPatientId && "bg-muted"
            )}
          >
            <div className="font-medium text-foreground">{patient.firstName} {patient.lastName}</div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
