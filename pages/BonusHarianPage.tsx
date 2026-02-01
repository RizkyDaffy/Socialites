
import React, { useState } from 'react';

interface BonusHarianPageProps {
  onBack: () => void;
}

const BonusHarianPage: React.FC<BonusHarianPageProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [streakDay, setStreakDay] = useState(1);
  const [canClaim, setCanClaim] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');

  // Initialize state
  React.useEffect(() => {
    fetchData();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) return; // Should redirect to login

      const res = await fetch('/api/coins', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setBalance(data.coins);
      setStreakDay(data.daily.nextStreakDay);
      setCanClaim(data.daily.canClaim);
      setClaimed(!data.daily.canClaim);

      // Store time target for countdown
      if (data.daily.timeUntilNextClaim > 0) {
        const targetTime = Date.now() + data.daily.timeUntilNextClaim;
        localStorage.setItem('nextClaimTime', targetTime.toString());
      } else {
        localStorage.removeItem('nextClaimTime');
      }
      updateTimer();

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTimer = () => {
    const targetStr = localStorage.getItem('nextClaimTime');
    if (!targetStr) {
      setTimeUntilNext('');
      return;
    }

    const target = parseInt(targetStr);
    const diff = target - Date.now();

    if (diff <= 0) {
      setTimeUntilNext('Sekarang!');
      // Refresh if it was counting down and we didn't just claim
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeUntilNext(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const handleClaim = async () => {
    if (!canClaim) return;
    setLoading(true);

    try {
      const sessionId = localStorage.getItem('sessionId');
      const idempotencyKey = crypto.randomUUID();

      const res = await fetch('/api/daily/claim', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
          'Idempotency-Key': idempotencyKey,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        setBalance(data.balance);
        setClaimed(true);
        setCanClaim(false);
        setStreakDay(data.streakDay);
        // Set timer for tomorrow
        const tomorrow = new Date();
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        tomorrow.setUTCHours(0, 0, 0, 0);
        localStorage.setItem('nextClaimTime', tomorrow.getTime().toString());
        updateTimer();

        // Simple alert for now, could be improved with toast
        // alert(`Berhasil klaim +${data.added} koin!`);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dailyRewards = [
    { day: 1, amount: 5 },
    { day: 2, amount: 5 },
    { day: 3, amount: 10 },
    { day: 4, amount: 5 },
    { day: 5, amount: 5 },
    { day: 6, amount: 5 },
    { day: 7, amount: 50 },
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
        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
          <img src="https://img.icons8.com/fluency/48/stack-of-coins.png" className="w-4 h-4" alt="coin" />
          <span className="text-sm font-bold text-yellow-700">{balance !== null ? balance : '...'}</span>
        </div>
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
          {dailyRewards.map((reward) => {
            let status = 'locked';
            // If this day is less than the day we are claiming next, it's past/claimed
            if (reward.day < streakDay) {
              status = 'claimed';
            }
            // If this day is the one we are claiming next
            else if (reward.day === streakDay) {
              status = canClaim ? 'current' : 'claimed'; // If cannot claim (already claimed), then today is claimed
            }

            return (
              <div
                key={reward.day}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border-[1.5px] transition-all ${status === 'claimed'
                  ? 'bg-gray-50 border-gray-100 opacity-60'
                  : status === 'current'
                    ? 'bg-white border-primary shadow-md scale-105'
                    : 'bg-white border-white shadow-sm'
                  }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-widest ${status === 'current' ? 'text-primary' : 'text-gray-300'}`}>
                  Day {reward.day}
                </span>
                <img
                  src="https://img.icons8.com/fluency/48/stack-of-coins.png"
                  className={`w-6 h-6 object-contain ${status === 'claimed' ? 'grayscale' : ''}`}
                  alt="Coins"
                />
                <span className={`text-[13px] font-bold ${status === 'current' ? 'text-appleDark' : 'text-gray-400'}`}>
                  +{reward.amount}
                </span>
              </div>
            );
          })}
          {/* Day 7 special big block */}
          <div className="col-span-1 hidden"></div>
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={!canClaim || loading}
          className={`w-full py-5 rounded-[18px] font-bold text-[17px] shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${!canClaim || loading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            : 'bg-primary text-white shadow-primary/20 hover:bg-[#345BA1]'
            }`}
        >
          {!canClaim ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              {loading ? 'Mohon tunggu...' : 'Telah Diklaim'}
            </>
          ) : (
            loading ? 'Memproses...' : 'Klaim Sekarang'
          )}
        </button>

        <div className="text-center">
          {!canClaim && timeUntilNext && (
            <p className="text-[12px] text-gray-400 font-medium">Kembali lagi dalam <span className="text-appleDark">{timeUntilNext}</span></p>
          )}
        </div>

      </main>

      <div className="h-10"></div>
    </div>
  );
};

export default BonusHarianPage;
