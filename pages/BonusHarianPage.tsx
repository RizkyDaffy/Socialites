
import React, { useState } from 'react';

interface BonusHarianPageProps {
  onBack: () => void;
}

const BonusHarianPage: React.FC<BonusHarianPageProps> = ({ onBack }) => {
  const [claimed, setClaimed] = useState(false);

  const dailyRewards = [
    { day: 1, amount: 5, status: 'pending' },
    { day: 2, amount: 5, status: 'pending' },
    { day: 3, amount: 10, status: 'pending' },
    { day: 4, amount: 5, status: 'pending' },
    { day: 5, amount: 5, status: 'pending' },
    { day: 6, amount: 5, status: 'pending' },
    { day: 7, amount: 50, status: 'pending' },
  ];

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
        <h1 className="text-lg font-bold">Bonus Harian</h1>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 p-5 max-w-lg mx-auto w-full space-y-6">

        {/* Header Hero Section */}
        <div className="bg-white rounded-apple p-8 shadow-sm border border-white text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
            <img
              src="https://img.icons8.com/fluency/96/gift.png"
              alt="Gift"
              className="w-16 h-16 object-contain animate-bounce"
            />
          </div>
          <h2 className="text-[22px] font-bold text-appleDark mb-2">Dapatkan Bonus Harian!</h2>
          <p className="text-[14px] text-gray-400 leading-relaxed px-4">
            Login setiap hari untuk mendapatkan koin gratis secara cuma-cuma.
          </p>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-4 gap-3">
          {dailyRewards.map((reward) => (
            <div
              key={reward.day}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border-[1.5px] transition-all ${reward.status === 'claimed'
                ? 'bg-gray-50 border-gray-100 opacity-60'
                : reward.status === 'current'
                  ? 'bg-white border-primary shadow-md scale-105'
                  : 'bg-white border-white shadow-sm'
                }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-widest ${reward.status === 'current' ? 'text-primary' : 'text-gray-300'}`}>
                Day {reward.day}
              </span>
              <img
                src="https://img.icons8.com/fluency/48/stack-of-coins.png"
                className={`w-6 h-6 object-contain ${reward.status === 'claimed' ? 'grayscale' : ''}`}
                alt="Coins"
              />
              <span className={`text-[13px] font-bold ${reward.status === 'current' ? 'text-appleDark' : 'text-gray-400'}`}>
                +{reward.amount}
              </span>
            </div>
          ))}
          {/* Day 7 special big block */}
          <div className="col-span-1 hidden"></div>
        </div>

        {/* Claim Button */}
        <button
          onClick={() => setClaimed(true)}
          disabled={claimed}
          className={`w-full py-5 rounded-[18px] font-bold text-[17px] shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${claimed
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            : 'bg-primary text-white shadow-primary/20 hover:bg-[#345BA1]'
            }`}
        >
          {claimed ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Telah Diklaim
            </>
          ) : (
            'Klaim Sekarang'
          )}
        </button>

        <div className="text-center">
          <p className="text-[12px] text-gray-400 font-medium">Kembali lagi dalam <span className="text-appleDark">14:23:05</span></p>
        </div>

      </main>

      <div className="h-10"></div>
    </div>
  );
};

export default BonusHarianPage;
