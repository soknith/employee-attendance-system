import { useCallback, useState } from 'react';

export type GpsState = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  timestamp: number | null;
};

const initialState: GpsState = {
  latitude: null,
  longitude: null,
  accuracy: null,
  loading: false,
  error: null,
  timestamp: null,
};

const ERROR_MESSAGES_EN: Record<number, string> = {
  1: 'GPS permission denied. Please enable location access in your browser settings.',
  2: 'Unable to determine location. Please check your internet connection or GPS signal.',
  3: 'Location request timed out. Please try again.',
};

const ERROR_MESSAGES_KM: Record<number, string> = {
  1: 'ការអនុញ្ញាត GPS ត្រូវបានបដិសេធ។ សូមបើកអនុញ្ញាតទីតាំងក្នុងការកំណត់ browser។',
  2: 'មិនអាចកំណត់ទីតាំងបានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិតឬសញ្ញា GPS។',
  3: 'ការកំណត់ទីតាំងអស់ពេលវេលា។ សូមព្យាយាមម្តងទៀត។',
};

let lang: 'km' | 'en' = 'km';

export function setGpsLang(l: 'km' | 'en') {
  lang = l;
}

export function useGps() {
  const [state, setState] = useState<GpsState>(initialState);

  const getLocation = useCallback((): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null> => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        const msg = lang === 'km' ? 'browser នេះមិនគាំទ្រ GPS ទេ។' : 'This browser does not support GPS.';
        setState((s) => ({ ...s, error: msg }));
        resolve(null);
        return;
      }

      setState((s) => ({ ...s, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setState({ latitude, longitude, accuracy, loading: false, error: null, timestamp: position.timestamp });
          resolve({ latitude, longitude, accuracy });
        },
        (err) => {
          const messages = lang === 'km' ? ERROR_MESSAGES_KM : ERROR_MESSAGES_EN;
          const message = messages[err.code] || err.message || (lang === 'km' ? 'កំហុសមិនស្គាល់ក្នុងការកំណត់ទីតាំង។' : 'Unknown location error.');
          setState((s) => ({ ...s, loading: false, error: message }));
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, []);

  const clear = useCallback(() => setState(initialState), []);

  return { ...state, getLocation, clear };
}
