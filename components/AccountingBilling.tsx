import React, { useState, useMemo } from 'react';
import { Invoice } from '../types';
import { FileText, Download, Check, Clock, AlertCircle, DollarSign, X, Printer, CreditCard } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

interface AccountingBillingProps {
  invoices: Invoice[];
  onAction: (action: string, details?: any) => void;
  onUpdateStatus: (id: string, newStatus: Invoice['status']) => void;
  onShowToast?: (message: string) => void;
}

export const AccountingBilling: React.FC<AccountingBillingProps> = ({ invoices, onAction, onUpdateStatus, onShowToast }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Calculate summaries dynamically
  const summary = useMemo(() => {
    return {
      unpaidCount: invoices.filter(i => i.status !== 'Paid').length,
      pendingClaims: invoices.filter(i => i.status === 'Pending Insurance').reduce((acc, curr) => acc + curr.amount, 0),
      paidThisMonth: invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0)
    };
  }, [invoices]);

  // Fungsi Real Export CSV
  const handleExportCSV = () => {
    onAction('Export CSV');
    
    // Define headers
    const headers = ['ID Tagihan', 'Nama Pasien', 'Tanggal', 'Jumlah', 'Status', 'Jumlah Item'];
    
    // Map data to CSV rows
    const rows = invoices.map(inv => [
      inv.id,
      inv.patientName,
      inv.date,
      inv.amount.toString(),
      inv.status,
      inv.items.toString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    // Create Blob and Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Keuangan_SIMRS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast("Laporan keuangan berhasil diunduh.");
  };

  return (
    <div className="space-y-6 relative">
      {/* Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-[#0A1A2F] px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <FileText size={20} className="text-[#0FAF94]" /> 
                 Detail Invoice #{selectedInvoice.id}
              </h3>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Header Invoice */}
              <div className="flex justify-between border-b border-slate-100 pb-6">
                 <div>
                    <p className="text-sm text-slate-500">Pasien</p>
                    <h4 className="text-xl font-bold text-[#1D2939]">{selectedInvoice.patientName}</h4>
                    <p className="text-xs font-mono text-slate-400 mt-1">RM-ID: {selectedInvoice.id.replace('TAG', 'RM')}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-sm text-slate-500">Total Tagihan</p>
                    <h4 className="text-2xl font-bold text-[#0D7A68]">{formatRupiah(selectedInvoice.amount)}</h4>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${
                       selectedInvoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                       selectedInvoice.status === 'Pending Insurance' ? 'bg-blue-100 text-blue-800' :
                       'bg-rose-100 text-rose-800'
                    }`}>
                       {selectedInvoice.status === 'Paid' ? 'LUNAS' : selectedInvoice.status === 'Pending Insurance' ? 'MENUNGGU KLAIM' : 'JATUH TEMPO'}
                    </span>
                 </div>
              </div>

              {/* Rincian Item (Mockup) */}
              <div>
                 <h5 className="font-bold text-[#1D2939] mb-3">Rincian Layanan</h5>
                 <div className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                             <th className="px-4 py-2">Deskripsi Layanan</th>
                             <th className="px-4 py-2 text-right">Biaya</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-200">
                          <tr>
                             <td className="px-4 py-3 text-slate-700">Jasa Medis & Konsultasi Dokter</td>
                             <td className="px-4 py-3 text-right font-medium">{formatRupiah(selectedInvoice.amount * 0.3)}</td>
                          </tr>
                          <tr>
                             <td className="px-4 py-3 text-slate-700">Obat-obatan & Farmasi</td>
                             <td className="px-4 py-3 text-right font-medium">{formatRupiah(selectedInvoice.amount * 0.2)}</td>
                          </tr>
                          <tr>
                             <td className="px-4 py-3 text-slate-700">Tindakan / Penunjang Medis</td>
                             <td className="px-4 py-3 text-right font-medium">{formatRupiah(selectedInvoice.amount * 0.5)}</td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3 justify-end pt-4">
                 <button 
                   onClick={() => {
                      if (onShowToast) onShowToast("Mencetak Invoice...");
                      onAction('Print Invoice', { id: selectedInvoice.id });
                   }}
                   className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                 >
                    <Printer size={18} /> Cetak
                 </button>
                 
                 {selectedInvoice.status !== 'Paid' && (
                   <button 
                     onClick={() => {
                        onUpdateStatus(selectedInvoice.id, 'Paid');
                        setSelectedInvoice(prev => prev ? {...prev, status: 'Paid'} : null);
                     }}
                     className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#0D7A68] text-white font-bold hover:bg-[#0B6656] shadow-md transition-colors cursor-pointer active:scale-95"
                   >
                      <CreditCard size={18} /> Proses Pembayaran
                   </button>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
         <div 
           className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] group focus:outline-none focus:ring-2 focus:ring-[#0D7A68]"
           tabIndex={0}
           onClick={() => onAction('Click Summary Card', { type: 'Unpaid Bills' })}
         >
            <p className="text-sm font-bold text-slate-500 group-hover:text-[#0D7A68]">Tagihan Belum Lunas</p>
            <p className="mt-2 text-2xl font-bold text-[#1D2939]">{summary.unpaidCount}</p>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-rose-500 w-[35%]"></div>
            </div>
         </div>
         <div 
           className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] group focus:outline-none focus:ring-2 focus:ring-[#0D7A68]"
           tabIndex={0}
           onClick={() => onAction('Click Summary Card', { type: 'Pending Claims' })}
         >
            <p className="text-sm font-bold text-slate-500 group-hover:text-[#0D7A68]">Klaim Asuransi Tertunda</p>
            <p className="mt-2 text-2xl font-bold text-[#1D2939]">{formatRupiah(summary.pendingClaims)}</p>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-amber-500 w-[65%]"></div>
            </div>
         </div>
         <div 
           className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] group focus:outline-none focus:ring-2 focus:ring-[#0D7A68]"
           tabIndex={0}
           onClick={() => onAction('Click Summary Card', { type: 'Paid Revenue' })}
         >
            <p className="text-sm font-bold text-slate-500 group-hover:text-[#0D7A68]">Pelunasan Bulan Ini</p>
            <p className="mt-2 text-2xl font-bold text-[#1D2939]">{formatRupiah(summary.paidThisMonth)}</p>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-[#0D7A68] w-[82%]"></div>
            </div>
         </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between">
           <div>
              <h3 className="font-bold text-[#1D2939]">Transaksi Terkini</h3>
              <p className="text-sm text-slate-500">Feed billing real-time dari semua poli</p>
           </div>
           <button 
             className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-[#0D7A68] hover:bg-slate-50 transition-colors cursor-pointer border border-slate-300 hover:border-[#0D7A68] rounded-lg px-4 py-2.5 active:bg-slate-100 shadow-sm focus:ring-2 focus:ring-[#0D7A68]"
             onClick={handleExportCSV}
           >
              <Download size={16} />
              Ekspor CSV
           </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-bold">ID Tagihan</th>
                <th className="px-6 py-3 font-bold">Pasien/Entitas</th>
                <th className="px-6 py-3 font-bold">Tanggal</th>
                <th className="px-6 py-3 font-bold">Item Layanan</th>
                <th className="px-6 py-3 font-bold text-right">Jumlah</th>
                <th className="px-6 py-3 font-bold">Status</th>
                <th className="px-6 py-3 font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr 
                  key={inv.id} 
                  className="group hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => {
                    onAction('Click Invoice Row', { id: inv.id });
                    setSelectedInvoice(inv);
                  }}
                >
                  <td className="px-6 py-4 font-mono font-medium text-slate-600">{inv.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{inv.patientName}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{inv.date}</td>
                  <td className="px-6 py-4 text-slate-600">{inv.items} layanan</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">
                    {formatRupiah(inv.amount)}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`flex items-center gap-1.5 w-fit rounded px-2.5 py-1 text-xs font-bold border
                        ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                          inv.status === 'Pending Insurance' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                          'bg-rose-100 text-rose-800 border-rose-200'}`}>
                        {inv.status === 'Paid' && <Check size={12} />}
                        {inv.status === 'Pending Insurance' && <Clock size={12} />}
                        {inv.status === 'Overdue' && <AlertCircle size={12} />}
                        
                        {inv.status === 'Paid' && 'Lunas'}
                        {inv.status === 'Pending Insurance' && 'Klaim Proses'}
                        {inv.status === 'Overdue' && 'Jatuh Tempo'}
                     </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                     <button 
                       className="flex items-center gap-1 text-slate-500 hover:text-[#0D7A68] bg-slate-100 hover:bg-emerald-50 transition-colors cursor-pointer p-2.5 rounded-lg active:scale-95 focus:ring-2 focus:ring-[#0D7A68] border border-slate-200 hover:border-[#0D7A68]"
                       title="Lihat Detail Lengkap"
                       onClick={(e) => {
                         e.stopPropagation(); 
                         setSelectedInvoice(inv);
                         onAction('View Invoice Detail', { id: inv.id });
                       }}
                     >
                        <FileText size={18} />
                     </button>
                     
                     {inv.status !== 'Paid' && (
                        <button 
                          className="flex items-center gap-1 text-white bg-[#0D7A68] hover:bg-[#0B6656] transition-colors cursor-pointer px-4 py-2 rounded-lg text-xs font-bold shadow-md active:scale-95 active:shadow-sm focus:ring-2 focus:ring-[#0D7A68]"
                          title="Tandai Lunas / Bayar"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(inv.id, 'Paid');
                          }}
                        >
                           <DollarSign size={14} />
                           Bayar
                        </button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};