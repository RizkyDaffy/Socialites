
import React from 'react';
import { useCoinBalance } from '../lib/hooks';

interface BuyCoinsPageProps {
  onBack: () => void;
}

const BuyCoinsPage: React.FC<BuyCoinsPageProps> = ({ onBack }) => {
  const { balance, refreshBalance } = useCoinBalance();
  const [selectedPackage, setSelectedPackage] = React.useState<{ coins: number; price: number; priceText: string } | null>(null);
  const [loading, setLoading] = React.useState(false);

  const packages = [
    { coins: 150, price: 5000, priceText: 'IDR 5.000' },
    { coins: 300, price: 9000, priceText: 'IDR 9.000' },
    { coins: 400, price: 11000, priceText: 'IDR 11.000' },
    { coins: 500, price: 13000, priceText: 'IDR 13.000' },
    { coins: 600, price: 17000, priceText: 'IDR 17.000' },
    { coins: 700, price: 19000, priceText: 'IDR 19.000' },
    { coins: 800, price: 20000, priceText: 'IDR 20.000' },
    { coins: 1000, price: 25000, priceText: 'IDR 25.000' },
  ];

  const handlePay = async () => {
    if (!selectedPackage) return;
    setLoading(true);

    try {
      const sessionId = localStorage.getItem('sessionId');
      const res = await fetch('/api/topup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          packageCoins: selectedPackage.coins,
          price: selectedPackage.price
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Trigger Snap
      if (window.snap) {
        window.snap.pay(data.snapToken, {
          onSuccess: function (result: any) {
            console.log('[Snap] Success:', result);
            refreshBalance();
            alert('Pembayaran berhasil!');
            setSelectedPackage(null);
          },
          onPending: function (result: any) {
            console.log('[Snap] Pending:', result);
            alert('Menunggu pembayaran...');
            // Usually pending means they closed the popup but didn't finish payment in UI, 
            // or chose async payment. We follow user rule: reload.
          },
          onError: function (result: any) {
            console.log('[Snap] Error:', result);
            alert('Pembayaran gagal!');
          },
          onClose: function () {
            console.log('[Snap] Closed');
            alert('Anda menutup popup pembayaran');
          }
        });
      } else {
        alert('Midtrans Snap not loaded');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      alert('Gagal memproses pembayaran: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-appleGray flex flex-col relative">
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

      <main className="flex-1 p-5 space-y-6 max-w-lg mx-auto w-full pb-32">
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
              onClick={() => setSelectedPackage(pkg)}
              className={`p-4 pl-6 rounded-apple border-[1.5px] shadow-sm flex items-center justify-between transition-all active:scale-[0.98] group ${selectedPackage?.coins === pkg.coins
                ? 'bg-blue-50 border-primary ring-1 ring-primary'
                : 'bg-white border-white hover:border-primary'
                }`}
            >
              <div className="flex items-center gap-10">
                <img src="https://img.icons8.com/fluency/48/stack-of-coins.png" className="w-8 h-8 object-contain" alt="Coin" />
                <span className="text-[18px] font-bold text-appleDark group-hover:text-primary transition-colors">{pkg.coins} Koin</span>
              </div>
              <div className={`px-4 py-2 text-[12px] font-bold rounded-lg shadow-md transition-colors ${selectedPackage?.coins === pkg.coins
                ? 'bg-primary text-white shadow-primary/20'
                : 'bg-primary/90 text-white'
                }`}>
                {pkg.priceText}
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Bottom Payment Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white shadow-2xl rounded-t-3xl p-6 transition-transform duration-300 ease-in-out z-50 border-t border-gray-100 ${selectedPackage ? 'translate-y-0' : 'translate-y-full'
          }`}
      >
        <div className="w-full max-w-lg mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Total Pembayaran</p>
              <h3 className="text-2xl font-bold text-appleDark">{selectedPackage?.priceText}</h3>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Mendapatkan</p>
              <h3 className="text-lg font-bold text-primary flex items-center gap-1 justify-end">
                <img src="https://img.icons8.com/fluency/48/stack-of-coins.png" className="w-5 h-5" alt="coin" />
                {selectedPackage?.coins} Koin
              </h3>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-primary/20 hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none flex justify-center"
          >
            {loading ? (
              <span className="animate-pulse">Memproses...</span>
            ) : (
              'Bayar Sekarang'
            )}
          </button>
        </div>
      </div>

      {/* Dimmed Overlay when Bottom Bar is active (Optional, makes it nicer) */}
      {selectedPackage && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={() => setSelectedPackage(null)}
        ></div>
      )}

      <div className="h-10"></div>
    </div>
  );
};

export default BuyCoinsPage;
