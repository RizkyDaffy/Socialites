
import React from 'react';

interface EarnCoinsPageProps {
  onBack: () => void;
  onMissionClick: () => void;
  onServicesClick: () => void;
  onBuyCoinsClick: () => void;
  onOrderHistoryClick: () => void;
  onDailyBonusClick: () => void;
}

const EarnCoinsPage: React.FC<EarnCoinsPageProps> = ({
  onBack,
  onMissionClick,
  onServicesClick,
  onBuyCoinsClick,
  onOrderHistoryClick,
  onDailyBonusClick
}) => {
  return (
    <div className="min-h-screen bg-appleGray flex flex-col">
      {/* Top Bar */}
      <header className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-appleDark hover:bg-gray-100 rounded-full transition-colors active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-appleGray/50 rounded-full">
          <img
            src="https://img.icons8.com/fluency/48/stack-of-coins.png"
            alt="Coins"
            className="w-5 h-5 object-contain"
          />
          <span className="font-bold text-appleDark text-lg">[$coins]</span>
        </div>

        <div className="w-10 h-10 bg-gray-300 rounded-full border-2 border-white shadow-sm overflow-hidden">
          <img src="https://ui-avatars.com/api/?name=User&background=D1D5DB&color=fff" alt="Profile" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-5 space-y-6 max-w-lg mx-auto w-full">

        {/* Section 1: Missions & Bonus */}
        <div className="bg-white rounded-apple p-6 shadow-sm border border-white flex flex-col gap-4">
          <button
            onClick={onMissionClick}
            className="w-full py-5 bg-primary text-white rounded-[14px] font-bold text-[16px] shadow-lg shadow-primary/20 transition-all hover:bg-[#345BA1] active:scale-[0.98]"
          >
            Koin dari misi
          </button>

          <button
            onClick={onDailyBonusClick}
            className="w-full py-5 bg-white text-appleDark border-[1.5px] border-primary/50 rounded-[14px] font-bold text-[16px] transition-all hover:bg-gray-50 active:scale-[0.98]"
          >
            Bonus Harian
          </button>

          <button
            onClick={onBuyCoinsClick}
            className="w-full py-5 bg-white text-appleDark border-[1.5px] border-primary/50 rounded-[14px] font-bold text-[16px] transition-all hover:bg-gray-50 active:scale-[0.98]"
          >
            Beli Koin Premium
          </button>
        </div>

        {/* Section 2: Services & History */}
        <div className="bg-white rounded-apple p-6 shadow-sm border border-white flex flex-col gap-4">
          <button
            onClick={onServicesClick}
            className="w-full py-5 bg-primary text-white rounded-[14px] font-bold text-[16px] shadow-lg shadow-primary/20 transition-all hover:bg-[#345BA1] active:scale-[0.98]"
          >
            Dapatkan Follower
          </button>

          <button
            onClick={onServicesClick}
            className="w-full py-5 bg-primary text-white rounded-[14px] font-bold text-[16px] shadow-lg shadow-primary/20 transition-all hover:bg-[#345BA1] active:scale-[0.98]"
          >
            Dapatkan Like
          </button>

          <button
            onClick={onOrderHistoryClick}
            className="w-full py-5 bg-white text-appleDark border-[1.5px] border-primary/50 rounded-[14px] font-bold text-[16px] transition-all hover:bg-gray-50 active:scale-[0.98]"
          >
            Order History
          </button>
        </div>

      </main>

      {/* Bottom Padding */}
      <div className="h-12"></div>
    </div>
  );
};

export default EarnCoinsPage;
