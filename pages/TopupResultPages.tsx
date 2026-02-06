
import React, { useEffect } from 'react';
import { useCoinBalance } from '../lib/hooks';

interface ResultPageProps {
    onBack: () => void;
}

export const TopupSuccessPage: React.FC<ResultPageProps> = ({ onBack }) => {
    const { refreshBalance } = useCoinBalance();

    useEffect(() => {
        // FIX: coin credit shared logic - Force refresh with retry to handle webhook delays
        const refresh = async () => {
            await refreshBalance();
            // Retry after 2 seconds in case webhook is still processing
            setTimeout(() => refreshBalance(), 2000);
        };
        refresh();
    }, [refreshBalance]);

    return (
        <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h1>
            <p className="text-gray-600 mb-8">Koin Anda telah berhasil ditambahkan.</p>
            <button
                onClick={onBack}
                className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-green-200 hover:bg-green-700 transition w-full max-w-xs"
            >
                Kembali ke Aplikasi
            </button>
        </div>
    );
};

export const TopupPendingPage: React.FC<ResultPageProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Tertunda</h1>
            <p className="text-gray-600 mb-8">Silakan selesaikan pembayaran Anda. Jika sudah, tunggu beberapa saat hingga status diperbarui.</p>
            <button
                onClick={onBack}
                className="bg-yellow-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-yellow-200 hover:bg-yellow-700 transition w-full max-w-xs"
            >
                Kembali
            </button>
        </div>
    );
};

export const TopupFailedPage: React.FC<ResultPageProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Gagal</h1>
            <p className="text-gray-600 mb-8">Maaf, pembayaran Anda gagal atau kadaluarsa. Silakan coba lagi.</p>
            <button
                onClick={onBack}
                className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-red-200 hover:bg-red-700 transition w-full max-w-xs"
            >
                Coba Lagi
            </button>
        </div>
    );
};
