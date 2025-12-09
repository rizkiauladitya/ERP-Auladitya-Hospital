import React, { useState, useEffect } from 'react';
import { MOCK_INVENTORY } from '../constants';
import { AlertTriangle, TrendingDown, CheckCircle, Package, Plus, Trash2, Printer, Save, ArrowLeft } from 'lucide-react';
import { POItem, InventoryItem } from '../types';
import { formatRupiah } from '../utils/formatters';

interface PharmacyInventoryProps {
  onAction: (action: string, details?: any) => void;
  onShowToast?: (message: string) => void;
}

export const PharmacyInventory: React.FC<PharmacyInventoryProps> = ({ onAction, onShowToast }) => {
  const [viewMode, setViewMode] = useState<'INVENTORY' | 'CREATE_PO'>('INVENTORY');
  
  // Inventory State dengan Persistensi LocalStorage
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('simrs_inventory');
    return saved ? JSON.parse(saved) : MOCK_INVENTORY;
  });

  // Simpan ke LocalStorage setiap kali inventory berubah
  useEffect(() => {
    localStorage.setItem('simrs_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // PO State
  const [poItems, setPoItems] = useState<POItem[]>([]);
  const [supplier, setSupplier] = useState('PT. Bio Farma (Persero)');
  const [warehouse, setWarehouse] = useState('Gudang Utama Farmasi');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState('');
  
  const handleAddItemToPO = () => {
    // Mengambil random item dari inventory SAAT INI (bukan mock statis) untuk simulasi
    const randomItem = inventory[Math.floor(Math.random() * inventory.length)];
    
    // Cek apakah item sudah ada di list PO
    const existingItemIndex = poItems.findIndex(i => i.itemId === randomItem.id);
    
    if (existingItemIndex >= 0) {
        // Jika sudah ada, tambah qty
        const newItems = [...poItems];
        newItems[existingItemIndex].qty += 10;
        setPoItems(newItems);
        if (onShowToast) onShowToast(`Menambahkan qty untuk ${randomItem.name}`);
    } else {
        // Jika belum, tambah item baru
        const newItem: POItem = {
          itemId: randomItem.id,
          itemName: randomItem.name,
          qty: 50, // Default qty pembelian
          unit: randomItem.unit,
          price: 15000 // Harga simulasi
        };
        setPoItems([...poItems, newItem]);
        onAction('Add Item to PO', newItem);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...poItems];
    newItems.splice(index, 1);
    setPoItems(newItems);
    onAction('Remove Item from PO', { index });
  };

  const calculateTotal = () => {
    return poItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
  };

  // Fungsi Submit PO yang Memperbarui Stok
  const handleSubmitPO = () => {
    if (poItems.length === 0) {
        if (onShowToast) onShowToast("Daftar item pesanan masih kosong.");
        return;
    }

    onAction('Submit PO', { items: poItems });

    // UPDATE LOGIC: Perbarui stok inventory berdasarkan item PO
    const updatedInventory = inventory.map(invItem => {
        const poItem = poItems.find(p => p.itemId === invItem.id);
        
        if (poItem) {
            const newStock = invItem.stock + poItem.qty;
            return {
                ...invItem,
                stock: newStock,
                // Jika stok bertambah, asumsi status kembali OK dan warning hilang
                status: 'OK' as InventoryItem['status'], 
                aiPrediction: undefined 
            };
        }
        return invItem;
    });

    setInventory(updatedInventory);
    
    // Tampilkan Notifikasi Visual sesuai request
    if (onShowToast) {
      onShowToast("Purchase Order berhasil dibuat");
    }
    
    // Reset State PO
    setViewMode('INVENTORY');
    setPoItems([]);
    setExpectedDate('');
    setOrderDate(new Date().toISOString().split('T')[0]);
  };

  if (viewMode === 'CREATE_PO') {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header PO */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => {
                 onAction('Back to Inventory');
                 setViewMode('INVENTORY');
               }}
               className="rounded-full p-2.5 hover:bg-slate-200 transition-colors cursor-pointer focus:ring-2 focus:ring-[#0D7A68]"
             >
               <ArrowLeft size={24} className="text-slate-700" />
             </button>
             <div>
               <h2 className="text-2xl font-bold text-[#1D2939]">Buat Purchase Order (PO)</h2>
               <p className="text-slate-500">PO Baru #{new Date().getFullYear()}-0092</p>
             </div>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => {
                 onAction('Print Draft PO');
                 if (onShowToast) onShowToast("Mencetak Draft PO...");
               }}
               className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer focus:ring-2 focus:ring-slate-300"
             >
               <Printer size={18} /> Cetak Draft
             </button>
             <button 
               onClick={handleSubmitPO}
               disabled={poItems.length === 0}
               className={`flex items-center gap-2 rounded-lg px-6 py-2.5 font-bold text-white shadow-md transition-all focus:ring-2 focus:ring-[#0D7A68]/50 ${
                 poItems.length === 0 
                   ? 'bg-slate-300 cursor-not-allowed opacity-70' 
                   : 'bg-[#0D7A68] hover:bg-[#0B6656] cursor-pointer active:scale-[0.98]'
               }`}
             >
               <Save size={18} /> Submit PO
             </button>
          </div>
        </div>

        {/* Form Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                 <h3 className="mb-4 font-bold text-[#1D2939] flex items-center gap-2">
                    <Package size={20} className="text-[#0D7A68]" /> Informasi Supplier
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-bold text-[#1D2939] mb-1">Supplier</label>
                       <select 
                         value={supplier}
                         onChange={(e) => setSupplier(e.target.value)}
                         className="w-full rounded-lg border border-slate-300 bg-[#F8FAFC] px-4 py-2.5 outline-none focus:border-[#0D7A68] focus:ring-1 focus:ring-[#0D7A68] cursor-pointer text-[#1D2939]"
                       >
                          <option>PT. Bio Farma (Persero)</option>
                          <option>PT. Kimia Farma Trading</option>
                          <option>PT. Anugrah Argon Medica</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-[#1D2939] mb-1">Gudang Tujuan</label>
                       <select 
                         value={warehouse}
                         onChange={(e) => setWarehouse(e.target.value)}
                         className="w-full rounded-lg border border-slate-300 bg-[#F8FAFC] px-4 py-2.5 outline-none focus:border-[#0D7A68] focus:ring-1 focus:ring-[#0D7A68] cursor-pointer text-[#1D2939]"
                       >
                          <option>Gudang Utama Farmasi</option>
                          <option>Depo IGD</option>
                          <option>Depo Rawat Inap</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-[#1D2939] mb-1">Tanggal Pesan</label>
                       <input 
                         type="date" 
                         value={orderDate}
                         onChange={(e) => setOrderDate(e.target.value)}
                         className="w-full rounded-lg border border-slate-300 bg-[#F8FAFC] px-4 py-2.5 outline-none focus:border-[#0D7A68] focus:ring-1 focus:ring-[#0D7A68] text-[#1D2939]" 
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-[#1D2939] mb-1">Tanggal Ekspektasi</label>
                       <input 
                         type="date" 
                         value={expectedDate}
                         onChange={(e) => setExpectedDate(e.target.value)}
                         className="w-full rounded-lg border border-slate-300 bg-[#F8FAFC] px-4 py-2.5 outline-none focus:border-[#0D7A68] focus:ring-1 focus:ring-[#0D7A68] text-[#1D2939]" 
                       />
                    </div>
                 </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                 <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-200">
                    <h3 className="font-bold text-[#1D2939]">Daftar Item Pesanan</h3>
                    <button 
                      onClick={handleAddItemToPO}
                      className="flex items-center gap-2 text-sm font-bold text-[#0D7A68] hover:text-[#0B6656] hover:underline cursor-pointer"
                    >
                      <Plus size={16} /> Tambah Item (Simulasi)
                    </button>
                 </div>
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Item</th>
                        <th className="px-6 py-3 font-semibold w-32">Qty</th>
                        <th className="px-6 py-3 font-semibold">Satuan</th>
                        <th className="px-6 py-3 font-semibold text-right">Harga Satuan</th>
                        <th className="px-6 py-3 font-semibold text-right">Total</th>
                        <th className="px-6 py-3 font-semibold w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {poItems.length === 0 ? (
                        <tr>
                           <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                              Belum ada item ditambahkan. Klik "Tambah Item".
                           </td>
                        </tr>
                      ) : (
                        poItems.map((item, idx) => (
                           <tr key={idx} className="group hover:bg-slate-50">
                              <td className="px-6 py-3 font-bold text-slate-700">{item.itemName}</td>
                              <td className="px-6 py-3">
                                 <input 
                                   type="number" 
                                   value={item.qty}
                                   onChange={(e) => {
                                      const newItems = [...poItems];
                                      newItems[idx].qty = parseInt(e.target.value) || 0;
                                      setPoItems(newItems);
                                   }}
                                   className="w-full rounded border border-slate-300 px-2 py-1.5 text-center text-[#1D2939] font-bold outline-none focus:border-[#0D7A68] focus:ring-1 focus:ring-[#0D7A68] bg-white"
                                 />
                              </td>
                              <td className="px-6 py-3 text-slate-600">{item.unit}</td>
                              <td className="px-6 py-3 text-right text-slate-600">{formatRupiah(item.price)}</td>
                              <td className="px-6 py-3 text-right font-bold text-slate-800">{formatRupiah(item.price * item.qty)}</td>
                              <td className="px-6 py-3 text-right">
                                 <button 
                                   onClick={() => handleRemoveItem(idx)}
                                   className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </td>
                           </tr>
                        ))
                      )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Summary Sidebar */}
           <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sticky top-6">
                 <h3 className="mb-4 text-lg font-bold text-[#1D2939]">Ringkasan Pesanan</h3>
                 <div className="space-y-3 border-b border-slate-100 pb-4 mb-4">
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-600">Subtotal</span>
                       <span className="font-bold text-slate-800">{formatRupiah(calculateTotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-600">PPN (11%)</span>
                       <span className="font-bold text-slate-800">{formatRupiah(calculateTotal() * 0.11)}</span>
                    </div>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="font-bold text-[#1D2939] text-lg">Total</span>
                    <span className="font-bold text-[#0D7A68] text-xl">{formatRupiah(calculateTotal() * 1.11)}</span>
                 </div>
                 <p className="text-xs text-slate-500 mt-4 text-center">
                    Mohon periksa kembali item sebelum submit. PO tidak dapat diubah setelah disetujui.
                 </p>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: INVENTORY LIST
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-[#0A1A2F] to-[#0D223E] p-6 text-white shadow-lg cursor-default select-none border border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#01B39A] mb-2">
               <Package size={20} />
               <span className="text-sm font-bold uppercase tracking-wider">Analisis Inventaris</span>
            </div>
            <h2 className="text-2xl font-bold">Intelijen Stok Farmasi</h2>
            <p className="mt-2 text-slate-300 max-w-xl leading-relaxed">
              Analisis AI mendeteksi {inventory.filter(i => i.status !== 'OK').length} item pada tingkat kritis berdasarkan laju konsumsi saat ini. 
              Pembuatan Purchase Order (PO) otomatis disarankan.
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm border border-white/10">
             <div className="text-center">
                <span className="block text-3xl font-bold">98.5%</span>
                <span className="text-xs font-medium text-slate-300 uppercase">Tingkat Akurasi</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Stock Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
             <h3 className="font-bold text-[#1D2939]">Stok Obat & Alkes</h3>
             <div className="flex gap-2">
                <button 
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => {
                    onAction('Download Report');
                    if (onShowToast) onShowToast("Mengunduh Laporan Inventaris...");
                  }}
                >
                  Unduh Laporan
                </button>
                <button 
                  className="flex items-center gap-1 rounded-lg bg-[#0D7A68] px-3 py-1.5 text-sm font-bold text-white hover:bg-[#0B6656] transition-colors cursor-pointer shadow-sm active:scale-95"
                  onClick={() => {
                    onAction('Create New PO');
                    setViewMode('CREATE_PO');
                  }}
                >
                  <Plus size={16} /> Buat PO
                </button>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-bold">Nama Item</th>
                  <th className="px-6 py-3 font-bold">Kategori</th>
                  <th className="px-6 py-3 font-bold">Stok</th>
                  <th className="px-6 py-3 font-bold">Batch / ED</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => (
                  <tr 
                    key={item.id} 
                    className="group hover:bg-slate-50 transition-colors cursor-pointer" 
                    onClick={() => {
                      onAction('View Item Detail', { id: item.id });
                      if (onShowToast) onShowToast(`Melihat detail untuk ${item.name}`);
                    }}
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 group-hover:text-[#0D7A68] transition-colors">{item.name}</p>
                      <p className="text-xs font-medium text-slate-500">{item.id}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {item.category === 'Medicine' ? 'Obat' : 
                       item.category === 'Consumable' ? 'Bahan Habis Pakai' : 'Alat Kesehatan'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      {item.stock} <span className="text-slate-500 text-xs font-normal">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 font-medium">{item.batchNumber}</p>
                      <p className="text-xs text-slate-500">ED: {item.expiryDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border
                        ${item.status === 'Critical' ? 'bg-rose-100 text-rose-800 border-rose-200' : 
                          item.status === 'Low' ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                          'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                        {item.status === 'Critical' && <AlertTriangle size={12} />}
                        {item.status === 'Low' && <TrendingDown size={12} />}
                        {item.status === 'OK' && <CheckCircle size={12} />}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Predictions Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-[#1D2939]">Peringatan AI</h3>
            <div className="space-y-4">
              {inventory.filter(i => i.aiPrediction).length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                    <CheckCircle className="mx-auto mb-2 text-[#0D7A68]" size={32} />
                    <p>Semua stok dalam kondisi aman.</p>
                </div>
              ) : (
                inventory.filter(i => i.aiPrediction).map(item => (
                    <div 
                      key={`alert-${item.id}`} 
                      className="relative overflow-hidden rounded-lg border border-amber-200 bg-amber-50 p-4 cursor-default"
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <AlertTriangle size={48} className="text-amber-600" />
                      </div>
                      <h4 className="font-bold text-amber-900">{item.name}</h4>
                      <p className="mt-1 text-sm font-medium text-amber-800">{item.aiPrediction}</p>
                      <button 
                        className="mt-3 w-full rounded bg-white py-2 text-xs font-bold text-amber-800 shadow-sm hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer active:scale-[0.98]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction('Create Purchase Order From Alert', { id: item.id });
                          setViewMode('CREATE_PO');
                          const newItem: POItem = {
                             itemId: item.id,
                             itemName: item.name,
                             qty: 50,
                             unit: item.unit,
                             price: 15000
                          };
                          setPoItems([newItem]);
                        }}
                      >
                        Buat Purchase Order
                      </button>
                    </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};