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
    { id: 'PT12345', name: 'John Doe', email: 'john.doe@example.com', age: 45, gender: 'Male', lastVisit: '2023-10-26', status: 'Active', dob: '1978-05-15', contactNumber: '+1234567890', address: '123 Main St, Anytown, USA', insuranceProvider: 'Metropolitan', policyNumber: 'POL-12345', emergencyContact: { name: 'Jane Doe', relationship: 'Spouse', contactNumber: '+1234567891' }},
    { id: 'PT12346', name: 'Jane Smith', email: 'jane.smith@example.com', age: 32, gender: 'Female', lastVisit: '2023-11-15', status: 'Active' },
    { id: 'PT12347', name: 'Peter Jones', email: 'peter.jones@example.com', age: 62, gender: 'Male', lastVisit: '2023-09-01', status: 'Inactive' },
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
    { id: 'APP001', patientName: 'John Doe', doctorName: 'Dr. Emily Carter', date: '2024-08-15', time: '10:00 AM', type: 'Consultation', status: 'Scheduled' },
    { id: 'APP002', patientName: 'Jane Smith', doctorName: 'Dr. Ben Hanson', date: '2024-08-15', time: '11:30 AM', type: 'Follow-up', status: 'Scheduled' },
    { id: 'APP003', patientName: 'Peter Jones', doctorName: 'Dr. Emily Carter', date: '2024-08-14', time: '02:00 PM', type: 'Check-up', status: 'Completed' },
    { id: 'APP004', patientName: 'Alice Johnson', doctorName: 'Dr. Ben Hanson', date: '2024-08-14', time: '03:00 PM', type: 'Consultation', status: 'Canceled' },
];

export type Invoice = {
  invoiceId: string;
  patientName: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
};

export const invoices: Invoice[] = [
    { invoiceId: 'INV001', patientName: 'John Doe', date: '2024-08-15', amount: 150, status: 'Pending' },
    { invoiceId: 'INV002', patientName: 'Peter Jones', date: '2024-08-14', amount: 75, status: 'Paid' },
    { invoiceId: 'INV003', patientName: 'Jane Smith', date: '2024-07-20', amount: 200, status: 'Overdue' },
];

export const consultationTypes = [
  { value: "general", label: "General Consultation", icon: Stethoscope },
  { value: "telehealth", label: "Telehealth", icon: Video },
  { value: "follow-up", label: "Follow-up", icon: FileText },
];

export type User = {
  name: string;
  email: string;
  role: 'doctor' | 'receptionist' | 'admin' | 'patient';
  status?: 'Active' | 'Inactive';
  password?: string;
}

export const users: User[] = [
    { name: 'Dr. Emily Carter', email: 'emily.carter@clinicoffice.com', role: 'doctor', password: 'password123' },
    { name: 'Dr. Ben Hanson', email: 'ben.hanson@clinicoffice.com', role: 'doctor', password: 'password123' },
    { name: 'Sarah Lee', email: 'sarah.lee@clinicoffice.com', role: 'receptionist', password: 'password123' },
    { name: 'Admin User', email: 'admin@clinicoffice.com', role: 'admin', password: 'Admin@1234' },
];
