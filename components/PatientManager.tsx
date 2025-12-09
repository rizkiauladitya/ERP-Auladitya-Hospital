import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_PATIENTS } from '../constants';
import { Filter, Plus, Search, Calendar, ChevronDown, User, FileText, Trash2, Edit, Save, ArrowLeft } from 'lucide-react';
import { Patient } from '../types';

interface PatientManagerProps {
  onAction: (action: string, details?: any) => void;
  onShowToast?: (message: string) => void;
}

export const PatientManager: React.FC<PatientManagerProps> = ({ onAction, onShowToast }) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'REGISTER'>('LIST');
  const [showFilters, setShowFilters] = useState(false);
  
  // Data State (Simulasi Database Lokal) with Persistence
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('simrs_patients');
    return saved ? JSON.parse(saved) : MOCK_PATIENTS;
  });

  // Save to LocalStorage whenever patients list changes
  useEffect(() => {
    localStorage.setItem('simrs_patients', JSON.stringify(patients));
  }, [patients]);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [insuranceFilter, setInsuranceFilter] = useState('Semua Penjamin');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    nik: '',
    dob: '',
    gender: 'Laki-laki',
    insuranceType: 'BPJS Kesehatan',
    phone: ''
  });

  // Filter Logic
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        patient.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'Semua Status' || 
        (statusFilter === 'Rawat Inap' && patient.status === 'In-Patient') ||
        (statusFilter === 'Rawat Jalan' && patient.status === 'Out-Patient') ||
        (statusFilter === 'Sudah Pulang' && patient.status === 'Discharged');

      const matchesInsurance = insuranceFilter === 'Semua Penjamin' || 
        patient.insurance.includes(insuranceFilter === 'Tunai' ? 'Tunai' : insuranceFilter === 'Asuransi Swasta' ? 'Asuransi' : 'BPJS');

      return matchesSearch && matchesStatus && matchesInsurance;
    });
  }, [patients, searchTerm, statusFilter, insuranceFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  
  // Ensure we don't stay on an empty page after deletion
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const displayedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (patient: Patient) => {
    setIsEditing(true);
    setEditId(patient.id);
    setFormData({
      fullName: patient.name,
      nik: '3201234567890001', // Mock data
      dob: '1980-01-01', // Mock data
      gender: patient.gender === 'Male' ? 'Laki-laki' : 'Perempuan',
      insuranceType: patient.insurance,
      phone: '08123456789' // Mock data
    });
    setViewMode('REGISTER');
    onAction('Edit Patient', { id: patient.id });
  };

  const handleDeleteClick = (id: string) => {
    // REVISI: Menghapus window.confirm yang sering memblokir
    // Langsung hapus dan tampilkan toast sukses
    setPatients(prev => prev.filter(p => p.id !== id));
    onAction('Delete Patient', { id });
    
    if (onShowToast) {
      onShowToast("Data pasien berhasil dihapus.");
    }
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editId) {
      // Update Existing
      setPatients(prev => prev.map(p => 
        p.id === editId 
          ? { ...p, name: formData.fullName, insurance: formData.insuranceType, gender: formData.gender === 'Laki-laki' ? 'Male' : 'Female' } 
          : p
      ));
      onAction('Update Patient', { id: editId, ...formData });
      if (onShowToast) onShowToast("Data Pasien Berhasil Diperbarui!");
    } else {
      // Add New
      const newId = `RM-00${patients.length + 1}`;
      const newPatient: Patient = {
        id: newId,
        name: formData.fullName,
        age: 30, // Default mock
        gender: formData.gender === 'Laki-laki' ? 'Male' : 'Female',
        status: 'Out-Patient',
        insurance: formData.insuranceType,
        lastVisit: new Date().toISOString().split('T')[0],
        condition: 'Pemeriksaan Baru'
      };
      setPatients([newPatient, ...patients]);
      onAction('Create Patient', formData);
      if (onShowToast) onShowToast(`Pasien Baru Berhasil Didaftarkan dengan ID ${newId}`);
    }
    
    // Reset
    setViewMode('LIST');
    setIsEditing(false);
    setEditId(null);
    setFormData({
      fullName: '',
      nik: '',
      dob: '',
      gender: 'Laki-laki',
      insuranceType: 'BPJS Kesehatan',
      phone: ''
    });
  };

  const resetForm = () => {
    setViewMode('LIST');
    setIsEditing(false);
    setEditId(null);
    setFormData({
      fullName: '',
      nik: '',
      dob: '',
      gender: 'Laki-laki',
      insuranceType: 'BPJS Kesehatan',
      phone: ''
    });
  };

  // Render Form Registrasi / Edit
  if (viewMode === 'REGISTER') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <button 
            onClick={resetForm}
            className="rounded-full p-2.5 hover:bg-slate-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D7A68]"
          >
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <h2 className="text-2xl font-bold text-[#1D2939]">
            {isEditing ? 'Edit Data Pasien' : 'Registrasi Pasien Baru'}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmitRegistration} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Identitas Dasar */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-bold text-[#0D7A68]">
                  <User size={18} /> Identitas Pasien
                </h3>
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">Nama Lengkap</label>
                  <input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    type="text" 
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 outline-none transition-all focus:border-[#0D7A68] focus:ring-2 focus:ring-[#0D7A68]/20"
                    placeholder="Sesuai KTP"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">NIK / No. KTP</label>
                  <input 
                    name="nik"
                    value={formData.nik}
                    onChange={handleInputChange}
                    type="number" 
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 outline-none transition-all focus:border-[#0D7A68] focus:ring-2 focus:ring-[#0D7A68]/20"
                    placeholder="16 digit angka"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-slate-700">Tanggal Lahir</label>
                    <input 
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      type="date" 
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 outline-none transition-all focus:border-[#0D7A68] focus:ring-2 focus:ring-[#0D7A68]/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-slate-700">Jenis Kelamin</label>
                    <select 
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 outline-none transition-all focus:border-[#0D7A68] focus:ring-2 focus:ring-[#0D7A68]/20"
                    >
                      <option>Laki-laki</option>
                      <option>Perempuan</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Kontak & Asuransi */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-bold text-[#0D7A68]">
                  <FileText size={18} /> Detail Administrasi
                </h3>
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">Nomor Telepon / WhatsApp</label>
                  <input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    type="tel" 
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 outline-none transition-all focus:border-[#0D7A68] focus:ring-2 focus:ring-[#0D7A68]/20"
                    placeholder="0812..."
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">Penjamin / Asuransi</label>
                  <select 
                    name="insuranceType"
                    value={formData.insuranceType}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-500 outline-none transition-all focus:border-[#0D7A68] focus:ring-2 focus:ring-[#0D7A68]/20"
                  >
                    <option>BPJS Kesehatan</option>
                    <option>Asuransi Swasta (Admedika)</option>
                    <option>Asuransi Swasta (Prudential)</option>
                    <option>Umum / Tunai</option>
                    <option>Jaminan Perusahaan</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4 border-t border-slate-100 pt-6">
              <button 
                type="button"
                className="rounded-lg border border-slate-300 px-6 py-3 font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer focus:ring-2 focus:ring-slate-300"
                onClick={resetForm}
              >
                Batal
              </button>
              <button 
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-[#0D7A68] px-6 py-3 font-bold text-white shadow-md hover:bg-[#0B6656] transition-all cursor-pointer active:scale-[0.98] focus:ring-4 focus:ring-[#0D7A68]/30"
              >
                <Save size={18} />
                {isEditing ? 'Perbarui Data Pasien' : 'Simpan Data Pasien'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render List View
  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1D2939]">Manajemen Pasien</h2>
          <p className="text-slate-500">Kelola rekam medis, pendaftaran, dan riwayat kunjungan.</p>
        </div>
        <div className="flex gap-3">
          <button 
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition-colors cursor-pointer shadow-sm active:scale-[0.98] focus:ring-2 focus:ring-slate-300 ${showFilters ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            onClick={() => {
              onAction('Toggle Filter Visibility');
              setShowFilters(!showFilters);
            }}
          >
            <Filter size={16} />
            Filter
          </button>
          <button 
            className="flex items-center gap-2 rounded-lg bg-[#0D7A68] px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#0B6656] transition-colors cursor-pointer active:scale-[0.98] focus:ring-2 focus:ring-[#0D7A68]/50"
            onClick={() => {
              onAction('Click Register New Patient');
              setViewMode('REGISTER');
            }}
          >
            <Plus size={16} />
            Registrasi Pasien
          </button>
        </div>
      </div>

      {/* Expanded Filters Area - Fully Functional */}
      {showFilters && (
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4 animate-fade-in">
          <div className="relative">
            <label className="mb-1 text-xs font-bold text-slate-600 uppercase">Pencarian</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Nama / No. RM" 
                value={searchTerm}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm text-[#1D2939] outline-none focus:border-[#0D7A68] focus:ring-1 focus:ring-[#0D7A68]"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset page on search
                  onAction('Filter Search Input', { query: e.target.value });
                }}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 text-xs font-bold text-slate-600 uppercase">Tanggal Kunjungan</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-8 text-sm text-[#1D2939] outline-none focus:border-[#0D7A68] focus:ring-1 focus:ring-[#0D7A68] cursor-pointer"
                onChange={(e) => onAction('Filter Date Change', { value: e.target.value })}
              >
                <option>Semua Waktu</option>
                <option>Hari Ini</option>
                <option>Minggu Ini</option>
                <option>Bulan Ini</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
          </div>
          <div>
            <label className="mb-1 text-xs font-bold text-slate-600 uppercase">Status Pasien</label>
            <div className="relative">
              <select 
                value={statusFilter}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-8 text-sm text-[#1D2939] outline-none focus:border-[#0D7A68] focus:ring-1 focus:ring-[#0D7A68] cursor-pointer"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                  onAction('Filter Status Change', { value: e.target.value });
                }}
              >
                <option>Semua Status</option>
                <option>Rawat Inap</option>
                <option>Rawat Jalan</option>
                <option>Sudah Pulang</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
          </div>
          <div>
            <label className="mb-1 text-xs font-bold text-slate-600 uppercase">Asuransi</label>
            <div className="relative">
              <select 
                value={insuranceFilter}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-8 text-sm text-[#1D2939] outline-none focus:border-[#0D7A68] focus:ring-1 focus:ring-[#0D7A68] cursor-pointer"
                onChange={(e) => {
                  setInsuranceFilter(e.target.value);
                  setCurrentPage(1);
                  onAction('Filter Insurance Change', { value: e.target.value });
                }}
              >
                <option>Semua Penjamin</option>
                <option>BPJS Kesehatan</option>
                <option>Asuransi Swasta</option>
                <option>Tunai</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>
      )}

      {/* Patient Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold">No. RM</th>
              <th className="px-6 py-4 font-bold">Nama Pasien</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold">Penjamin/Asuransi</th>
              <th className="px-6 py-4 font-bold">Kunjungan Terakhir</th>
              <th className="px-6 py-4 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedPatients.length > 0 ? (
              displayedPatients.map((patient) => (
                <tr 
                  key={patient.id} 
                  className="group hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => {
                    onAction('Click Patient Row', { id: patient.id });
                    if (onShowToast) onShowToast(`Melihat Rekam Medis: ${patient.name}`);
                  }}
                >
                  <td className="px-6 py-4 font-semibold text-slate-600">{patient.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-[#1D2939] group-hover:text-[#0D7A68] transition-colors">{patient.name}</p>
                      <p className="text-xs font-medium text-slate-500">{patient.age} thn • {patient.gender === 'Male' ? 'Laki-laki' : 'Perempuan'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold
                      ${patient.status === 'In-Patient' ? 'bg-indigo-100 text-indigo-800' : 
                        patient.status === 'Out-Patient' ? 'bg-emerald-100 text-emerald-800' : 
                        'bg-slate-100 text-slate-700'}`}>
                      {patient.status === 'In-Patient' && 'Rawat Inap'}
                      {patient.status === 'Out-Patient' && 'Rawat Jalan'}
                      {patient.status === 'Discharged' && 'Pulang'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{patient.insurance}</td>
                  <td className="px-6 py-4 text-slate-600">{patient.lastVisit}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer focus:ring-2 focus:ring-blue-500"
                        title="Edit Data"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(patient);
                        }}
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer focus:ring-2 focus:ring-rose-500"
                        title="Hapus Data"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(patient.id);
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                  Tidak ada data pasien yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Functional Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <p className="text-sm font-medium text-slate-500">
            Menampilkan {displayedPatients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredPatients.length)} dari {filteredPatients.length} pasien
          </p>
          <div className="flex gap-2">
            <button 
              className={`rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer focus:ring-2 focus:ring-slate-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
                onAction('Prev Page');
              }}
            >
              Sebelumna
            </button>
            <button 
              className={`rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer active:bg-slate-100 focus:ring-2 focus:ring-slate-300 ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={currentPage >= totalPages}
              onClick={() => {
                setCurrentPage(prev => Math.min(prev + 1, totalPages));
                onAction('Next Page');
              }}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};