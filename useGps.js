import { useState, useCallback } from 'react';

export function useGps() {
    const [location, setLocation] = useState(null);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    const getLocation = useCallback(() => {
        return new Promise((resolve, reject) => {
            setStatus('loading');
            setError(null);

            if (!navigator.geolocation) {
                setStatus('error');
                setError('Geolocation not supported');
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                    };
                    setLocation(loc);
                    setStatus('success');
                    resolve(loc);
                },
                (err) => {
                    setStatus('error');
                    setError(err.message);
                    reject(err);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    }, []);

    return { location, status, error, getLocation };
}
