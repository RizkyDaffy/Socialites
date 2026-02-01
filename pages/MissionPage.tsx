
import React, { useState } from 'react';

interface MissionPageProps {
  onBack: () => void;
}

const MissionPage: React.FC<MissionPageProps> = ({ onBack }) => {
  const [isLinked, setIsLinked] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleLinkAccount = () => {
    if (!username.trim()) {
      setError('Harap masukkan username Instagram Anda');
      return;
    }
    setError('');
    setIsLinked(true);
  };

  const VideoPlayer = () => (
    <div className="w-full space-y-3 mt-4">
      <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest px-1">Panduan Misi</p>
      <div className="w-full aspect-video bg-black rounded-[24px] overflow-hidden shadow-xl shadow-black/10 relative group">
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="Panduan SocialBoost"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );

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

      <main className="flex-1 p-5 max-w-lg mx-auto w-full flex flex-col gap-5">
        {!isLinked ? (
          /* NOT LINKED STATE */
          <div className="flex flex-col gap-5 mt-2">
            <div className="bg-white rounded-apple p-8 shadow-sm border border-white text-center">
              <h2 className="text-[19px] font-bold text-appleDark mb-4">Oppss!! akun mu belum di tautkan</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed px-4 mb-6">
                tautkan akun instagram untuk mendapatkan koin dengan mengikuti dan mengerjakan tugas
              </p>

              {/* Instagram Username Input */}
              <div className="relative mb-4 group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[16px] group-focus-within:text-primary transition-colors">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                  placeholder="username_kamu"
                  className={`w-full pl-10 pr-5 py-4 bg-appleGray/50 border ${error ? 'border-red-300' : 'border-gray-100'} rounded-[16px] text-[16px] font-medium text-appleDark focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all`}
                />
              </div>

              {/* Info Text */}
              <div className="flex items-center justify-center gap-2 text-[12px] text-gray-400 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                <span>Gunakan akun Instagram yang sama</span>
              </div>

              {error && <p className="text-[11px] text-red-500 font-bold mt-2 uppercase tracking-tight">{error}</p>}
            </div>

            <button
              onClick={handleLinkAccount}
              className="w-full py-5 bg-primary text-white rounded-[14px] font-bold text-[15px] shadow-lg shadow-primary/20 transition-all hover:bg-[#345BA1] active:scale-[0.98] uppercase tracking-wide"
            >
              TAUTKAN AKUN INSTAGRAM
            </button>

            <VideoPlayer />
          </div>
        ) : (
          /* MISSION ACTIVE STATE */
          <div className="flex flex-col gap-5 mt-2">
            {/* User Info Card */}
            <div className="bg-white rounded-apple p-6 shadow-sm border border-white">
              <h2 className="text-[18px] font-bold text-appleDark mb-1">@{username}</h2>
              <p className="text-[13px] text-gray-400 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                Gunakan akun yang sama di aplikasi instagram
              </p>
            </div>

            {/* Mission Content */}
            <div className="bg-white rounded-apple p-4 shadow-sm border border-white flex flex-col">
              <div className="w-full aspect-square bg-[#EBEDF0] rounded-[18px] mb-6 relative overflow-hidden flex items-center justify-center">
                <img src="https://img.icons8.com/fluency/96/instagram-new.png" className="w-20 h-20 opacity-20" alt="IG icon" />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent"></div>
              </div>

              <div className="space-y-4">
                <button className="w-full py-5 bg-primary text-white rounded-[14px] font-bold text-[16px] shadow-lg shadow-primary/20 transition-all hover:bg-[#345BA1] active:scale-[0.98]">
                  Kerjakan misi
                </button>
                <button className="w-full py-5 bg-white text-appleDark border-[1.5px] border-primary/50 rounded-[14px] font-bold text-[16px] transition-all hover:bg-gray-50 active:scale-[0.98]">
                  Melewati misi
                </button>
              </div>
            </div>

            {/* Reward Info Card */}
            <div className="bg-white rounded-apple p-6 shadow-sm border border-white text-center">
              <p className="text-[14px] text-gray-600 font-medium">
                Anda akan mendapatkan <span className="text-primary font-bold">1 koin</span> untuk misi ini
              </p>
            </div>

            <VideoPlayer />
          </div>
        )}
      </main>

      <div className="h-10"></div>
    </div>
  );
};

export default MissionPage;
