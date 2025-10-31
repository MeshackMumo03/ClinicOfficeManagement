import { FileText, Stethoscope, Video } from "lucide-react";

export type Patient = {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  lastVisit: string;
  status: 'Active' | 'Inactive';
  dob?: string,
  contactNumber?: string,
  address?: string,
  insuranceProvider?: string,
  policyNumber?: string,
  emergencyContact?: {
      name: string;
      relationship: string;
      contactNumber: string;
  }
};

export const patients: Patient[] = [];

export type Appointment = {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'Consultation' | 'Follow-up' | 'Check-up';
  status: 'Scheduled' | 'Completed' | 'Canceled';
};

export const appointments: Appointment[] = [];

export type Invoice = {
  invoiceId: string;
  patientName: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
};

export const invoices: Invoice[] = [];

export const consultationTypes = [
  { value: "general", label: "General Consultation", icon: Stethoscope },
  { value: "telehealth", label: "Telehealth", icon: Video },
  { value: "follow-up", label: "Follow-up", icon: FileText },
];

export type User = {
  name: string;
  email: string;
  role: 'Doctor' | 'Nurse' | 'Receptionist' | 'Admin';
  status: 'Active' | 'Inactive';
}

export const users: User[] = [];
