
import React, { useState } from 'react';
import { useCoinBalance } from '../lib/hooks';

interface ServicesPageProps {
  onBack: () => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('Pengikut');
  const tabs = ['Pengikut', 'Like', 'Share', 'Repost'];
  const { balance } = useCoinBalance();

  const services = [
    { label: '100', cost: '150' },
    { label: '200', cost: '300' },
    { label: '300', cost: '400' },
    { label: '400', cost: '500' },
    { label: '500', cost: '600' },
    { label: '600', cost: '700' },
    { label: '700', cost: '800' },
    { label: '800', cost: '900' },
    { label: '900', cost: '1000' },
    { label: '1000', cost: '1100' },
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
        {/* Service Header Card */}
        <div className="bg-white rounded-apple p-6 shadow-sm border border-white space-y-5">
          <h2 className="text-[19px] font-bold text-appleDark">Layanan Tersedia</h2>

          <input
            type="text"
            placeholder="Username / link postingan"
            className="w-full px-5 py-3.5 bg-appleGray/30 border border-gray-200 rounded-2xl text-[14px] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
          />

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all whitespace-nowrap active:scale-95 ${activeTab === tab
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-4">
          {services.map((service, index) => (
            <button
              key={index}
              className="bg-white p-5 rounded-apple border-[1.5px] border-white shadow-sm flex flex-col items-start gap-4 transition-all hover:border-primary active:scale-95 text-left group"
            >
              <div className="space-y-1">
                <span className="text-[13px] font-semibold text-gray-300 block">{service.label} {activeTab}</span>
                <div className="flex items-center gap-2">
                  <img src="https://img.icons8.com/fluency/48/stack-of-coins.png" className="w-6 h-6 object-contain grayscale group-hover:grayscale-0 transition-all" alt="Coin" />
                  <span className="text-[20px] font-bold text-appleDark">{service.cost}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      <div className="h-10"></div>
    </div>
  );
};

export default ServicesPage;
