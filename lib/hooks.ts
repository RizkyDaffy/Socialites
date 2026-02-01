
import { useState, useEffect } from 'react';

export function useCoinBalance() {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        fetchBalance();

        // Optional: Refresh every minute or on focus? For now simple fetch on mount.
        // If we wanted real-time, we'd need polling or websockets. 
        // Let's add simple polling every 10s to keep it fresh across tabs? 
        // The user didn't ask for it, but "display yg sama" implies live data.
        // BonusHarianPage didn't seem to have polling for balance except on action.
    }, []);

    return { balance, loading };
}
