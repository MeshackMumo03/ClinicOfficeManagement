'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Patient = {
  id: string;
  name: string;
};

interface PatientListProps {
  patients: Patient[];
  selectedPatientId: string;
}

export function PatientList({ patients, selectedPatientId }: PatientListProps) {
  return (
    <div className="border rounded-lg bg-card text-card-foreground">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search patients..." className="pl-8 w-full" />
        </div>
      </div>
      <div className="divide-y">
        <div className="grid grid-cols-2 p-4 font-medium text-muted-foreground">
          <div>Name</div>
          <div>ID</div>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
        {patients.map(patient => (
          <Link href={`/dashboard/patients`} key={patient.id} passHref>
            <div
              className={cn(
                "grid grid-cols-2 p-4 cursor-pointer hover:bg-muted/50",
                patient.id === selectedPatientId && "bg-muted"
              )}
            >
              <div className="font-medium text-foreground">{patient.name}</div>
              <div className="text-primary">{patient.id}</div>
            </div>
          </Link>
        ))}
        </div>
      </div>
    </div>
  );
}
