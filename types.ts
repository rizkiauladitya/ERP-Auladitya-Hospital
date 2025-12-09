export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  status: 'In-Patient' | 'Out-Patient' | 'Discharged';
  insurance: string;
  lastVisit: string;
  condition: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Medicine' | 'Consumable' | 'Equipment';
  stock: number;
  unit: string;
  batchNumber: string;
  expiryDate: string;
  status: 'OK' | 'Low' | 'Critical' | 'Expired';
  aiPrediction?: string; // e.g., "Stock out in 5 days"
}

export interface Invoice {
  id: string;
  patientName: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending Insurance' | 'Overdue';
  items: number;
}

export interface KpiData {
  label: string;
  value: string | number;
  trend: number; // percentage
  trendLabel: string;
  color: string;
}

export interface POItem {
  itemId: string;
  itemName: string;
  qty: number;
  unit: string;
  price: number;
}