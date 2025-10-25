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

export const patients: Patient[] = [
  { id: 'PT12345', name: 'Sophia Clark', email: 'sophia.clark@email.com', age: 34, gender: 'Female', lastVisit: '2023-10-26', status: 'Active', dob: '1988-05-10', contactNumber: '(555) 123-4567', address: '123 Maple Street, Anytown, USA', insuranceProvider: 'United Health', policyNumber: 'UH123456789', emergencyContact: { name: 'James Clark', relationship: 'Spouse', contactNumber: '(555) 987-6543' } },
  { id: 'PT67890', name: 'Ethan Bennett', email: 'ethan.bennett@example.com', age: 45, gender: 'Male', lastVisit: '2023-10-25', status: 'Active' },
  { id: 'PT24680', name: 'Olivia Carter', email: 'olivia.carter@example.com', age: 29, gender: 'Female', lastVisit: '2023-09-15', status: 'Active' },
  { id: 'PT13579', name: 'Liam Davis', email: 'liam.davis@example.com', age: 56, gender: 'Male', lastVisit: '2023-11-01', status: 'Active' },
  { id: 'PT97531', name: 'Ava Evans', email: 'ava.evans@example.com', age: 42, gender: 'Female', lastVisit: '2023-08-20', status: 'Inactive' },
  { id: 'PT86420', name: 'Noah Foster', email: 'noah.foster@example.com', age: 38, gender: 'Male', lastVisit: '2023-11-02', status: 'Active' },
  { id: 'PT75309', name: 'Isabella Green', email: 'isabella.green@example.com', age: 62, gender: 'Female', lastVisit: '2023-07-11', status: 'Active' },
  { id: 'PT64298', name: 'Jackson Hayes', email: 'jackson.hayes@example.com', age: 25, gender: 'Male', lastVisit: '2023-10-30', status: 'Active' },
  { id: 'PT53187', name: 'Mia Ingram', email: 'mia.ingram@example.com', age: 31, gender: 'Female', lastVisit: '2024-07-10', status: 'Active' },
  { id: 'PT42076', name: 'Lucas Jenkins', email: 'lucas.jenkins@example.com', age: 49, gender: 'Male', lastVisit: '2024-07-01', status: 'Active' },
];

export type Appointment = {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'Consultation' | 'Follow-up' | 'Check-up';
  status: 'Scheduled' | 'Completed' | 'Canceled';
};

export const appointments: Appointment[] = [
    { id: 'APT001', patientName: 'Clara Bennett', doctorName: 'Dr. Olivia Carter', date: '2024-07-15', time: '10:00 AM', type: 'Consultation', status: 'Scheduled' },
    { id: 'APT002', patientName: 'Owen Foster', doctorName: 'Dr. Nathan Evans', date: '2024-07-15', time: '11:30 AM', type: 'Follow-up', status: 'Completed' },
    { id: 'APT003', patientName: 'Emma Harper', doctorName: 'Dr. Olivia Carter', date: '2024-07-16', time: '9:00 AM', type: 'Check-up', status: 'Scheduled' },
    { id: 'APT004', patientName: 'Lucas Hayes', doctorName: 'Dr. Nathan Evans', date: '2024-07-16', time: '2:00 PM', type: 'Consultation', status: 'Canceled' },
    { id: 'APT005', patientName: 'Ava Reynolds', doctorName: 'Dr. Olivia Carter', date: '2024-07-17', time: '1:00 PM', type: 'Consultation', status: 'Scheduled' },
];

export type Invoice = {
  invoiceId: string;
  patientName: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
};

export const invoices: Invoice[] = [
  { invoiceId: 'INV-001', patientName: 'John Doe', date: '2023-10-26', amount: 150.00, status: 'Paid' },
  { invoiceId: 'INV-002', patientName: 'Jane Smith', date: '2023-10-25', amount: 200.00, status: 'Paid' },
  { invoiceId: 'INV-003', patientName: 'Michael Johnson', date: '2023-09-15', amount: 75.00, status: 'Pending' },
  { invoiceId: 'INV-004', patientName: 'Emily Davis', date: '2023-11-01', amount: 150.00, status: 'Pending' },
  { invoiceId: 'INV-005', patientName: 'Sarah Brown', date: '2023-11-02', amount: 100.00, status: 'Paid' },
  { invoiceId: 'INV-006', patientName: 'Laura Taylor', date: '2023-10-30', amount: 250.00, status: 'Overdue' },
];

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

export const users: User[] = [
  { name: 'Dr. Olivia Carter', email: 'olivia.carter@clinic.com', role: 'Doctor', status: 'Active' },
  { name: 'Dr. Nathan Evans', email: 'nathan.evans@clinic.com', role: 'Doctor', status: 'Active' },
  { name: 'Sophia Turner', email: 'sophia.turner@clinic.com', role: 'Nurse', status: 'Active' },
  { name: 'Ryan Mitchell', email: 'ryan.mitchell@clinic.com', role: 'Receptionist', status: 'Active' },
  { name: 'Chloe Davis', email: 'chloe.davis@clinic.com', role: 'Admin', status: 'Active' },
];
