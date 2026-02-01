
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardPageProps {
  onGetCoins: () => void;
  onBuyCoins: () => void;
  onOrderHistory: () => void;
  onServices: () => void;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  onGetCoins,
  onBuyCoins,
  onOrderHistory,
  onServices,
  onLogout
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const sidebarItems = [
    {
      label: 'Dashboard',
      onClick: toggleSidebar,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
      )
    },
    {
      label: 'Pemesanan',
      onClick: onOrderHistory,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
      )
    },
    {
      label: 'Layanan',
      onClick: onServices,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
      )
    },
    {
      label: 'Deposit',
      onClick: onBuyCoins,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
      )
    },
    {
      label: 'Pengaturan',
      onClick: toggleSidebar,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
      )
    },
    {
      label: 'Keluar',
      onClick: onLogout,
      className: 'mt-auto text-red-500',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
      )
    },
  ];

  const handleHelpClick = () => {
    window.open('https://help.socialites.my.id', '_blank');
  };

  return (
    <div className="min-h-screen bg-appleGray flex flex-col relative overflow-hidden">

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            {/* Drawer Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
                    <img src="https://img.icons8.com/fluency-systems-filled/96/ffffff/rocket.png" className="w-5 h-5" alt="Logo" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">SocialBoost</span>
                </div>
                <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12" /><path d="m6 6 12 12" /></svg>
                </button>
              </div>

              <nav className="flex flex-col gap-2 flex-1">
                {sidebarItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.onClick}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all hover:bg-gray-50 active:scale-95 ${item.className || 'text-gray-700'}`}
                  >
                    <span className="opacity-70">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="pt-6 border-t border-gray-100 text-center">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">Version 2.0.4</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <header className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-appleDark hover:bg-gray-100 rounded-full transition-colors active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-appleGray/50 rounded-full">
          <img
            src="https://img.icons8.com/fluency/48/stack-of-coins.png"
            alt="Coins"
            className="w-5 h-5 object-contain"
          />
          <span className="font-bold text-appleDark text-lg">[$coins]</span>
        </div>

        <div className="w-10 h-10 bg-gray-300 rounded-full border-2 border-white shadow-sm overflow-hidden active:scale-90 transition-transform cursor-pointer">
          <img src="https://ui-avatars.com/api/?name=User&background=D1D5DB&color=fff" alt="Profile" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-5 space-y-6 max-w-lg mx-auto w-full">

        {/* Quick Menu */}
        <div className="bg-white rounded-apple p-3 flex justify-between shadow-sm border border-white">
          <button
            onClick={onBuyCoins}
            className="flex-1 flex flex-col items-center gap-2 py-3 hover:bg-gray-50 rounded-2xl transition-all active:scale-95 group"
          >
            <div className="text-primary group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
            </div>
            <span className="text-[12px] font-bold text-appleDark">Beli Coin</span>
          </button>

          <button
            onClick={onOrderHistory}
            className="flex-1 flex flex-col items-center gap-2 py-3 hover:bg-gray-50 rounded-2xl transition-all active:scale-95 group"
          >
            <div className="text-primary group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
            </div>
            <span className="text-[12px] font-bold text-appleDark">History</span>
          </button>

          <button
            onClick={handleHelpClick}
            className="flex-1 flex flex-col items-center gap-2 py-3 hover:bg-gray-50 rounded-2xl transition-all active:scale-95 group"
          >
            <div className="text-primary group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <span className="text-[12px] font-bold text-appleDark">Bantuan</span>
          </button>
        </div>

        {/* Action Buttons Card */}
        <div className="bg-white rounded-apple p-6 shadow-sm border border-white flex flex-col gap-4">
          <button
            onClick={onGetCoins}
            className="w-full py-5 bg-primary text-white rounded-[14px] font-bold text-[17px] shadow-lg shadow-primary/20 transition-all hover:bg-[#345BA1] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Dapatkan Koin
          </button>
          <button
            onClick={onBuyCoins}
            className="w-full py-5 bg-white text-appleDark border-[1.5px] border-gray-100 rounded-[14px] font-bold text-[17px] transition-all hover:bg-gray-50 active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Beli Koin
          </button>
        </div>

        {/* News Banner */}
        <div className="w-full aspect-[2/1] bg-primary rounded-[28px] shadow-inner overflow-hidden relative group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          {/* Decorative Pattern */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:scale-110 transition-transform duration-1000">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="pattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M0 24L24 0M-1 1L1 -1M23 25L25 23" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pattern)" />
            </svg>
          </div>
          <div className="absolute bottom-6 left-6 text-white">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 w-fit">News</div>
            <h3 className="text-xl font-bold leading-tight">Unlock Premium Features Today</h3>
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-white rounded-apple p-6 shadow-sm border border-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <h2 className="text-xl font-bold text-appleDark">Informasi</h2>
          </div>
          <div className="p-4 bg-appleGray rounded-xl border border-gray-100">
            <p className="text-[13px] text-gray-500 leading-relaxed italic">
              "Selamat datang di Skuypanel. Aplikasi ini masih dalam tahap pengembangan (Beta). Mohon atas perhatian dan dukungannya."
            </p>
          </div>
        </div>

      </main>

      {/* Bottom Padding for safe areas */}
      <div className="h-12"></div>
    </div>
  );
};

export default DashboardPage;
