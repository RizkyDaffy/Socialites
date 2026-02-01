
import React from 'react';

interface OrderHistoryPageProps {
  onBack: () => void;
}

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onBack }) => {
  const orders = [
    { id: '#SB-9281', type: 'Follower', amount: '500', date: 'Oct 24, 2023', status: 'Success', icon: '👤' },
    { id: '#SB-9275', type: 'Like', amount: '1000', date: 'Oct 22, 2023', status: 'Pending', icon: '❤️' },
    { id: '#SB-9260', type: 'Share', amount: '200', date: 'Oct 15, 2023', status: 'Failed', icon: '🔗' },
    { id: '#SB-9255', type: 'Follower', amount: '100', date: 'Oct 10, 2023', status: 'Success', icon: '👤' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-600';
      case 'Pending': return 'bg-yellow-100 text-yellow-600';
      case 'Failed': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-appleGray flex flex-col">
      {/* Top Bar */}
      <header className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-appleDark hover:bg-gray-100 rounded-full transition-colors active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 className="text-lg font-bold">Order History</h1>
        <div className="w-8"></div> {/* Spacer */}
      </header>

      <main className="flex-1 p-5 space-y-4 max-w-lg mx-auto w-full">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-apple p-5 shadow-sm border border-white flex items-center justify-between group transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-appleGray rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:bg-primary/5 transition-colors">
                  {order.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-appleDark">{order.amount} {order.type}</h3>
                  </div>
                  <p className="text-[12px] text-gray-400 mt-0.5">{order.id} • {order.date}</p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${getStatusColor(order.status)}`}>
                {order.status}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-center space-y-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm">📭</div>
            <p className="text-gray-400 font-medium">Belum ada riwayat pesanan.</p>
          </div>
        )}
      </main>

      <div className="h-10"></div>
    </div>
  );
};

export default OrderHistoryPage;
