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
  { id: 'PID009', name: 'Clara Bennett', email: 'clara.b@example.com', age: 31, gender: 'Female', lastVisit: '2024-07-10', status: 'Active' },
  { id: 'PID010', name: 'Owen Foster', email: 'owen.f@example.com', age: 49, gender: 'Male', lastVisit: '2024-07-01', status: 'Active' },
  { id: 'PID011', name: 'Emma Harper', email: 'emma.h@example.com', age: 28, gender: 'Female', lastVisit: '2024-06-20', status: 'Active' },
  { id: 'PID012', name: 'Lucas Hayes', email: 'lucas.h@example.com', age: 53, gender: 'Male', lastVisit: '2024-06-15', status: 'Active' },
  { id: 'PID013', name: 'Ava Reynolds', email: 'ava.r@example.com', age: 37, gender: 'Female', lastVisit: '2024-07-05', status: 'Active' },
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
