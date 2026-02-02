
import { useState, useEffect } from 'react';

export function useCoinBalance() {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchBalance = async () => {
        try {
            const sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                setLoading(false);
                return;
            }

            const res = await fetch('/api/coins', {
                headers: {
                    'Authorization': `Bearer ${sessionId}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setBalance(data.coins);
            }
        } catch (error) {
            console.error('Failed to fetch coin balance', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
        // Polling every 30s to keep it fresh
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, []);

    return { balance, loading, refreshBalance: fetchBalance };
}
