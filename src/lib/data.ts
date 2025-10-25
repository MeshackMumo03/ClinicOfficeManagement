import { FileText, Stethoscope, Video } from "lucide-react";

export type Patient = {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  lastVisit: string;
  status: 'Active' | 'Inactive';
};

export const patients: Patient[] = [
  { id: 'PID001', name: 'John Doe', email: 'john.doe@example.com', age: 45, gender: 'Male', lastVisit: '2023-10-26', status: 'Active' },
  { id: 'PID002', name: 'Jane Smith', email: 'jane.smith@example.com', age: 34, gender: 'Female', lastVisit: '2023-10-25', status: 'Active' },
  { id: 'PID003', name: 'Michael Johnson', email: 'michael.j@example.com', age: 56, gender: 'Male', lastVisit: '2023-09-15', status: 'Active' },
  { id: 'PID004', name: 'Emily Davis', email: 'emily.d@example.com', age: 29, gender: 'Female', lastVisit: '2023-11-01', status: 'Active' },
  { id: 'PID005', name: 'Chris Lee', email: 'chris.l@example.com', age: 42, gender: 'Other', lastVisit: '2023-08-20', status: 'Inactive' },
  { id: 'PID006', name: 'Sarah Brown', email: 'sarah.b@example.com', age: 38, gender: 'Female', lastVisit: '2023-11-02', status: 'Active' },
  { id: 'PID007', name: 'David Wilson', email: 'david.w@example.com', age: 62, gender: 'Male', lastVisit: '2023-07-11', status: 'Active' },
  { id: 'PID008', name: 'Laura Taylor', email: 'laura.t@example.com', age: 25, gender: 'Female', lastVisit: '2023-10-30', status: 'Active' },
];

export type Appointment = {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'Consultation' | 'Follow-up' | 'Check-up';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
};

export const appointments: Appointment[] = [
    { id: 'APT001', patientName: 'Emily Davis', doctorName: 'Dr. Smith', date: '2024-07-29', time: '10:00 AM', type: 'Consultation', status: 'Scheduled' },
    { id: 'APT002', patientName: 'John Doe', doctorName: 'Dr. Smith', date: '2024-07-29', time: '11:30 AM', type: 'Follow-up', status: 'Scheduled' },
    { id: 'APT003', patientName: 'Sarah Brown', doctorName: 'Dr. Jones', date: '2024-07-29', time: '02:00 PM', type: 'Check-up', status: 'Completed' },
    { id: 'APT004', patientName: 'Jane Smith', doctorName: 'Dr. Smith', date: '2024-07-30', time: '09:00 AM', type: 'Consultation', status: 'Scheduled' },
    { id: 'APT005', patientName: 'David Wilson', doctorName: 'Dr. Patel', date: '2024-07-30', time: '01:00 PM', type: 'Consultation', status: 'Cancelled' },
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
  { name: 'Dr. Olivia Bennett', email: 'olivia.bennett@clinic.com', role: 'Doctor', status: 'Active' },
  { name: 'Dr. Lucas Carter', email: 'lucas.carter@clinic.com', role: 'Doctor', status: 'Active' },
  { name: 'Sophia Turner', email: 'sophia.turner@clinic.com', role: 'Nurse', status: 'Active' },
  { name: 'Ryan Mitchell', email: 'ryan.mitchell@clinic.com', role: 'Receptionist', status: 'Active' },
  { name: 'Chloe Davis', email: 'chloe.davis@clinic.com', role: 'Admin', status: 'Active' },
];
