import { Patient, InventoryItem, Invoice } from './types';

// Data Pasien (Indonesian Context)
export const MOCK_PATIENTS: Patient[] = [
  { id: 'RM-001', name: 'Budi Santoso', age: 45, gender: 'Male', status: 'In-Patient', insurance: 'BPJS Kesehatan', lastVisit: '2023-10-24', condition: 'Pasca Operasi Jantung' },
  { id: 'RM-002', name: 'Siti Aminah', age: 32, gender: 'Female', status: 'Out-Patient', insurance: 'Asuransi Swasta (Admedika)', lastVisit: '2023-10-25', condition: 'Pemeriksaan Umum' },
  { id: 'RM-003', name: 'Andi Pratama', age: 25, gender: 'Male', status: 'In-Patient', insurance: 'Umum/Tunai', lastVisit: '2023-10-20', condition: 'Fisioterapi Cedera Lutut' },
  { id: 'RM-004', name: 'Dewi Lestari', age: 24, gender: 'Female', status: 'Discharged', insurance: 'BPJS Kesehatan', lastVisit: '2023-10-18', condition: 'Radiologi MRI' },
  { id: 'RM-005', name: 'Rina Kurniawati', age: 26, gender: 'Female', status: 'In-Patient', insurance: 'Asuransi Swasta (Prudential)', lastVisit: '2023-10-26', condition: 'Observasi Demam Berdarah' },
];

// Data Inventaris Farmasi (Indonesian Context)
export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'OBT-102', name: 'Amoxicillin 500mg', category: 'Medicine', stock: 450, unit: 'Tablet', batchNumber: 'B-8821', expiryDate: '2024-12-01', status: 'OK' },
  { id: 'OBT-105', name: 'Paracetamol Infus', category: 'Medicine', stock: 24, unit: 'Botol', batchNumber: 'B-9921', expiryDate: '2023-11-15', status: 'Critical', aiPrediction: 'Stok habis dalam 48 jam' },
  { id: 'BHP-201', name: 'Masker Bedah Medis', category: 'Consumable', stock: 1200, unit: 'Box', batchNumber: 'B-1122', expiryDate: '2025-01-01', status: 'OK' },
  { id: 'OBT-303', name: 'Ibuprofen Sirup', category: 'Medicine', stock: 15, unit: 'Botol', batchNumber: 'B-3321', expiryDate: '2024-05-10', status: 'Low', aiPrediction: 'Disarankan Restock Segera' },
  { id: 'ALK-505', name: 'Sarung Tangan Steril (L)', category: 'Equipment', stock: 300, unit: 'Pasang', batchNumber: 'B-4411', expiryDate: '2024-08-20', status: 'OK' },
];

// Transaksi Akuntansi Rumah Sakit yang Realistis
// Total Paid (Lunas) akan dihitung dinamis di App.tsx untuk sinkronisasi Dashboard
export const MOCK_INVOICES: Invoice[] = [
  { id: 'TAG-23-001', patientName: 'Budi Santoso', date: '2023-10-25', amount: 45000000, status: 'Pending Insurance', items: 4 }, // Operasi Jantung
  { id: 'TAG-23-002', patientName: 'Siti Aminah', date: '2023-10-25', amount: 850000, status: 'Paid', items: 2 }, // Konsultasi + Obat
  { id: 'TAG-23-003', patientName: 'Andi Pratama', date: '2023-10-24', amount: 3200000, status: 'Overdue', items: 7 }, // Rawat Inap VIP
  { id: 'TAG-23-004', patientName: 'Dewi Lestari', date: '2023-10-23', amount: 2850000, status: 'Paid', items: 3 }, // MRI Scan
  { id: 'TAG-23-005', patientName: 'Rina Kurniawati', date: '2023-10-26', amount: 5500000, status: 'Pending Insurance', items: 5 }, // Rawat Inap DBD
  { id: 'TAG-23-006', patientName: 'PT. Sehat Sejahtera', date: '2023-10-22', amount: 125000000, status: 'Paid', items: 50 }, // MCU Korporat
  { id: 'TAG-23-007', patientName: 'Ahmad Dani', date: '2023-10-21', amount: 150000, status: 'Paid', items: 1 }, // Poli Gigi
];

// Data Grafik Pendapatan vs Pasien
export const CHART_DATA = [
  { name: 'Sen', revenue: 45000000, patients: 124 },
  { name: 'Sel', revenue: 38000000, patients: 118 },
  { name: 'Rab', revenue: 52000000, patients: 145 },
  { name: 'Kam', revenue: 41000000, patients: 132 },
  { name: 'Jum', revenue: 65000000, patients: 150 },
  { name: 'Sab', revenue: 58000000, patients: 110 },
  { name: 'Min', revenue: 72000000, patients: 98 },
];