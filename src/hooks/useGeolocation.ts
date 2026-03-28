import { useState, useEffect } from 'react';

interface GeoState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
}

// Default: Bangkok center
const BANGKOK = { lat: 13.7563, lng: 100.5018 };

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    lat: BANGKOK.lat,
    lng: BANGKOK.lng,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, loading: false, error: 'Geolocation not supported' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
          loading: false,
        });
      },
      () => {
        // Use Bangkok default if denied
        setState(s => ({ ...s, loading: false }));
      },
      { timeout: 5000 }
    );
  }, []);

  return state;
}
