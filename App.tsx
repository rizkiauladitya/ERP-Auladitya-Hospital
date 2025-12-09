import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Pill, 
  CreditCard, 
  Settings, 
  Menu,
  Bell,
  Search,
  ChevronDown,
  Mic,
  User,
  X,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { PatientManager } from './components/PatientManager';
import { PharmacyInventory } from './components/PharmacyInventory';
import { AccountingBilling } from './components/AccountingBilling';
import { AiVoiceAgent } from './components/AiVoiceAgent';
import { NavItem } from './components/NavItem';
import { MOCK_INVOICES } from './constants';
import { Invoice } from './types';

// Define the available views
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  PATIENTS = 'PATIENTS',
  PHARMACY = 'PHARMACY',
  BILLING = 'BILLING',
  SETTINGS = 'SETTINGS',
  AI_AGENT = 'AI_AGENT'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Notification State with Type
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Settings State
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    twoFactor: true
  });
  
  const [profile, setProfile] = useState({
    name: 'Dr. Muhammad Rizki Auladitya',
    email: 'rizki.auladitya@simrs-studio.com',
    job: 'Chief Medical Officer'
  });

  // Data State - Lifted up to ensure synchronization between Accounting & Dashboard
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('simrs_invoices');
    return saved ? JSON.parse(saved) : MOCK_INVOICES;
  });

  // Persist Invoices
  useEffect(() => {
    localStorage.setItem('simrs_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Calculate Total Revenue dynamically based on 'Paid' invoices
  // This ensures Dashboard is always in sync with Accounting actions
  const totalRevenue = useMemo(() => {
    return invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);

  // Global UI Action Handler for logging and debugging
  const handleUiAction = (actionName: string, details?: any) => {
    const logDetails = details ? JSON.stringify(details) : '';
    console.log(`[UI ACTION] ${actionName} ${logDetails}`);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handler to update invoice status (e.g. Mark as Paid)
  // This triggers a re-render of Dashboard's revenue automatically
  const handleUpdateInvoiceStatus = (id: string, newStatus: Invoice['status']) => {
    handleUiAction('Update Invoice Status', { id, newStatus });
    setInvoices(prevInvoices => 
      prevInvoices.map(inv => 
        inv.id === id ? { ...inv, status: newStatus } : inv
      )
    );
    if (newStatus === 'Paid') {
      showToast(`Tagihan ${id} berhasil dibayar. Dashboard diperbarui.`);
    }
  };

  const handleNavClick = (view: ViewState) => {
    handleUiAction('Navigation', { to: view });
    setCurrentView(view);
    // On mobile, auto-close sidebar
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Function to render the active component based on state
  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return (
          <Dashboard 
            totalRevenue={totalRevenue} 
            onAction={handleUiAction}
            onNavigate={handleNavClick}
            onShowToast={(msg) => showToast(msg, 'success')}
          />
        );
      case ViewState.PATIENTS:
        return <PatientManager onAction={handleUiAction} onShowToast={(msg) => showToast(msg, 'success')} />;
      case ViewState.PHARMACY:
        return <PharmacyInventory onAction={handleUiAction} onShowToast={(msg) => showToast(msg, 'success')} />;
      case ViewState.BILLING:
        return (
          <AccountingBilling 
            invoices={invoices} 
            onAction={handleUiAction}
            onUpdateStatus={handleUpdateInvoiceStatus}
            onShowToast={(msg) => showToast(msg, 'success')}
          />
        );
      case ViewState.AI_AGENT:
        return <AiVoiceAgent onNavigate={handleNavClick} />;
      case ViewState.SETTINGS:
        return (
          <div className="max-w-4xl space-y-6 animate-fade-in pb-10">
             <div className="flex items-center gap-3 mb-6">
                <Settings className="text-[#0D7A68]" size={28} />
                <h2 className="text-2xl font-bold text-[#1D2939]">Pengaturan Sistem</h2>
             </div>

             <div className="grid grid-cols-1 gap-6">
                {/* Profile Settings */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="text-lg font-bold text-[#1D2939] mb-4 flex items-center gap-2">
                     <User size={20} className="text-[#0D7A68]" /> Profil Pengguna
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-semibold text-[#1D2939] mb-1">Nama Lengkap</label>
                         <input 
                           type="text" 
                           value={profile.name}
                           onChange={(e) => setProfile({...profile, name: e.target.value})}
                           className="w-full rounded-lg border border-[#D0D5DD] bg-[#F2F4F7] px-4 py-2.5 text-[#1D2939] outline-none focus:border-[#0D7A68] focus:ring-2 focus:ring-[#0D7A68]/20 transition-all placeholder-[#98A2B3]"
                           onClick={() => handleUiAction('Focus Settings Input', { field: 'Nama' })}
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-semibold text-[#1D2939] mb-1">Email</label>
                         <input 
                           type="text" 
                           value={profile.email}
                           onChange={(e) => setProfile({...profile, email: e.target.value})}
                           className="w-full rounded-lg border border-[#D0D5DD] bg-[#F2F4F7] px-4 py-2.5 text-[#1D2939] outline-none focus:border-[#0D7A68] focus:ring-2 focus:ring-[#0D7A68]/20 transition-all placeholder-[#98A2B3]"
                           onClick={() => handleUiAction('Focus Settings Input', { field: 'Email' })}
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-semibold text-[#1D2939] mb-1">Jabatan</label>
                         <input 
                           type="text" 
                           value={profile.job}
                           onChange={(e) => setProfile({...profile, job: e.target.value})}
                           className="w-full rounded-lg border border-[#D0D5DD] bg-[#F2F4F7] px-4 py-2.5 text-[#1D2939] outline-none focus:border-[#0D7A68] focus:ring-2 focus:ring-[#0D7A68]/20 transition-all placeholder-[#98A2B3]"
                           onClick={() => handleUiAction('Focus Settings Input', { field: 'Jabatan' })}
                         />
                      </div>
                   </div>
                </div>

                {/* Preferences */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="text-lg font-bold text-[#1D2939] mb-4 flex items-center gap-2">
                     <Settings size={20} className="text-[#0D7A68]" /> Preferensi Aplikasi
                   </h3>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F2F4F7] transition-colors cursor-pointer border border-transparent hover:border-slate-200" 
                           onClick={() => {
                             handleUiAction('Toggle Notification Setting');
                             setSettings(s => ({...s, notifications: !s.notifications}));
                           }}>
                         <div>
                            <p className="font-medium text-[#1D2939]">Notifikasi Email</p>
                            <p className="text-xs text-slate-500">Terima laporan harian via email</p>
                         </div>
                         <button className={`text-[#0D7A68] transition-transform ${settings.notifications ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                            {settings.notifications ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                         </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F2F4F7] transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                           onClick={() => {
                             handleUiAction('Toggle 2FA Setting');
                             setSettings(s => ({...s, twoFactor: !s.twoFactor}));
                           }}>
                         <div>
                            <p className="font-medium text-[#1D2939]">Otentikasi Dua Faktor (2FA)</p>
                            <p className="text-xs text-slate-500">Keamanan tambahan saat login</p>
                         </div>
                         <button className={`text-[#0D7A68] transition-transform ${settings.twoFactor ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                            {settings.twoFactor ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                         </button>
                      </div>
                   </div>
                </div>
                
                <div className="flex justify-end">
                   <button 
                     onClick={() => {
                       handleUiAction('Save Settings');
                       showToast("Pengaturan profil berhasil disimpan.");
                     }}
                     className="bg-[#0D7A68] hover:bg-[#0B6656] text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all active:scale-95 focus:ring-2 focus:ring-offset-2 focus:ring-[#0D7A68] cursor-pointer"
                   >
                     Simpan Perubahan
                   </button>
                </div>
             </div>
          </div>
        );
      default:
        return (
          <Dashboard 
            totalRevenue={totalRevenue} 
            onAction={handleUiAction}
            onNavigate={handleNavClick}
            onShowToast={(msg) => showToast(msg, 'success')}
          />
        );
    }
  };

  // Main App Interface
  return (
    <div className="flex h-screen w-full overflow-hidden text-[#1D2939] bg-slate-50">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-[60] animate-fade-in-down pointer-events-none">
          <div className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white shadow-xl border pointer-events-auto ${
            notification.type === 'error' 
              ? 'bg-rose-600 border-rose-700' 
              : 'bg-[#0A1A2F] border-slate-700'
          }`}>
            <div className={`h-2 w-2 rounded-full shadow-[0_0_8px] ${
               notification.type === 'error' ? 'bg-white shadow-white/50' : 'bg-[#0FAF94] shadow-[#0FAF94]'
            }`}></div>
            <p className="text-sm font-medium">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="ml-2 text-white/80 hover:text-white">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar - "Navy Dark Premium" Theme #0A1A2F */}
      <aside 
        className={`flex flex-col bg-[#0A1A2F] text-white transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } shadow-xl z-30`}
      >
        <div className="flex h-16 items-center justify-center border-b border-slate-800/50">
          {isSidebarOpen ? (
             <div className="flex items-center gap-2 font-bold text-xl tracking-wide text-[#01B39A]">
                <span>SIMRS</span>
                <span className="text-white font-light">STUDIO</span>
             </div>
          ) : (
            <span className="text-[#01B39A] font-bold text-xl">S</span>
          )}
        </div>

        <nav className="flex-1 space-y-2 py-6 px-3">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard Utama" 
            isActive={currentView === ViewState.DASHBOARD}
            isSidebarOpen={isSidebarOpen}
            onClick={() => handleNavClick(ViewState.DASHBOARD)}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Pasien & CRM" 
            isActive={currentView === ViewState.PATIENTS}
            isSidebarOpen={isSidebarOpen}
            onClick={() => handleNavClick(ViewState.PATIENTS)}
          />
          <NavItem 
            icon={<Pill size={20} />} 
            label="Farmasi & Stok" 
            isActive={currentView === ViewState.PHARMACY}
            isSidebarOpen={isSidebarOpen}
            onClick={() => handleNavClick(ViewState.PHARMACY)}
          />
          <NavItem 
            icon={<CreditCard size={20} />} 
            label="Akuntansi & Billing" 
            isActive={currentView === ViewState.BILLING}
            isSidebarOpen={isSidebarOpen}
            onClick={() => handleNavClick(ViewState.BILLING)}
          />
          
          <div className="my-4 border-t border-slate-800/50 pt-4">
             <NavItem 
               icon={<Mic size={20} />} 
               label="Asisten Suara AI" 
               isActive={currentView === ViewState.AI_AGENT}
               isSidebarOpen={isSidebarOpen}
               onClick={() => handleNavClick(ViewState.AI_AGENT)}
             />
          </div>
        </nav>

        <div className="p-3 border-t border-slate-800/50">
          <NavItem 
            icon={<Settings size={20} />} 
            label="Pengaturan" 
            isActive={currentView === ViewState.SETTINGS}
            isSidebarOpen={isSidebarOpen}
            onClick={() => handleNavClick(ViewState.SETTINGS)}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50 relative">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                handleUiAction('Toggle Sidebar');
                setIsSidebarOpen(!isSidebarOpen);
              }}
              className="rounded-full p-2.5 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer hover:text-[#0D7A68] focus:outline-none focus:ring-2 focus:ring-[#0D7A68]"
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-[#1D2939]">
              {currentView === ViewState.DASHBOARD && 'Ringkasan Eksekutif'}
              {currentView === ViewState.PATIENTS && 'Manajemen Pasien'}
              {currentView === ViewState.PHARMACY && 'Inventaris Farmasi'}
              {currentView === ViewState.BILLING && 'Keuangan & Klaim'}
              {currentView === ViewState.AI_AGENT && 'Asisten Cerdas (Voice Agent)'}
              {currentView === ViewState.SETTINGS && 'Pengaturan Sistem'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
              <input 
                type="text" 
                placeholder="Pencarian Global..." 
                className="h-10 w-64 rounded-full border border-slate-200 bg-[#F2F4F7] pl-10 pr-4 text-sm text-[#1D2939] outline-none focus:border-[#0D7A68] focus:ring-1 focus:ring-[#0D7A68] transition-all placeholder-slate-500"
                onFocus={() => handleUiAction('Focus Search Input')}
              />
            </div>
            
            <button 
              className="relative rounded-full p-2.5 text-slate-500 hover:bg-slate-100 cursor-pointer hover:text-[#0D7A68] focus:outline-none focus:ring-2 focus:ring-[#0D7A68]"
              onClick={() => {
                handleUiAction('Open Notifications');
                showToast("Tidak ada notifikasi baru saat ini.");
              }}
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <div 
                className="flex items-center gap-3 border-l border-slate-200 pl-6 cursor-pointer select-none group" 
                onClick={() => {
                  handleUiAction('Toggle Profile Menu');
                  setShowProfileMenu(!showProfileMenu);
                }}
              >
                <img 
                  src="https://picsum.photos/id/48/200/200" 
                  alt="Profile" 
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-[#0D7A68] transition-all"
                />
                <div className="hidden text-sm md:block">
                  <p className="font-bold text-[#1D2939] group-hover:text-[#0D7A68] transition-colors">{profile.name}</p>
                  <p className="text-xs text-slate-500">{profile.job}</p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl animate-fade-in z-50">
                   <div className="p-4 border-b border-slate-100">
                      <p className="font-bold text-[#1D2939]">{profile.name}</p>
                      <p className="text-xs text-slate-500 truncate">{profile.email}</p>
                   </div>
                   <div className="p-2">
                      <button 
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 text-left cursor-pointer transition-colors"
                        onClick={() => {
                          handleUiAction('Open Profile Settings');
                          showToast("Membuka Pengaturan Akun...");
                          setShowProfileMenu(false);
                          setCurrentView(ViewState.SETTINGS);
                        }}
                      >
                        <Settings size={16} /> Pengaturan Akun
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 scroll-smooth z-10">
          <div className="mx-auto max-w-7xl animate-fade-in h-full pb-10">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;