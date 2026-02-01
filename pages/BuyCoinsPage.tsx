
import React from 'react';
import { useCoinBalance } from '../lib/hooks';

interface BuyCoinsPageProps {
  onBack: () => void;
}

const BuyCoinsPage: React.FC<BuyCoinsPageProps> = ({ onBack }) => {
  const { balance } = useCoinBalance();
  const packages = [
    { coins: '150 Koin', price: 'IDR 5.000' },
    { coins: '300 Koin', price: 'IDR 9.000' },
    { coins: '400 Koin', price: 'IDR 11.000' },
    { coins: '500 Koin', price: 'IDR 13.000' },
    { coins: '600 Koin', price: 'IDR 17.000' },
    { coins: '700 Koin', price: 'IDR 19.000' },
    { coins: '800 Koin', price: 'IDR 20.000' },
    { coins: '1000 Koin', price: 'IDR 25.000' },
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

        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
          <img src="https://img.icons8.com/fluency/48/stack-of-coins.png" className="w-4 h-4" alt="coin" />
          <span className="text-sm font-bold text-yellow-700">{balance !== null ? balance : '...'}</span>
        </div>

        <div className="w-10 h-10 bg-gray-300 rounded-full border-2 border-white shadow-sm overflow-hidden">
          <img src="https://ui-avatars.com/api/?name=User&background=D1D5DB&color=fff" alt="Profile" />
        </div>
      </header>

      <main className="flex-1 p-5 space-y-6 max-w-lg mx-auto w-full">
        {/* Header Section */}
        <div className="bg-white rounded-apple p-6 shadow-sm border border-white space-y-1">
          <h2 className="text-[22px] font-bold text-appleDark">Beli Koin</h2>
          <p className="text-[13px] text-gray-400">Males ngumpulin koin? beli aja hehe</p>
        </div>

        {/* Coin Packages List */}
        <div className="flex flex-col gap-3">
          {packages.map((pkg, index) => (
            <button
              key={index}
              className="bg-white p-4 pl-6 rounded-apple border-[1.5px] border-white shadow-sm flex items-center justify-between transition-all hover:border-primary active:scale-[0.98] group"
            >
              <div className="flex items-center gap-10">
                <img src="https://img.icons8.com/fluency/48/stack-of-coins.png" className="w-8 h-8 object-contain" alt="Coin" />
                <span className="text-[18px] font-bold text-appleDark group-hover:text-primary transition-colors">{pkg.coins}</span>
              </div>
              <div className="px-4 py-2 bg-primary text-white text-[12px] font-bold rounded-lg shadow-md shadow-primary/20">
                {pkg.price}
              </div>
            </button>
          ))}
        </div>
      </main>

      <div className="h-10"></div>
    </div>
  );
};

export default BuyCoinsPage;
