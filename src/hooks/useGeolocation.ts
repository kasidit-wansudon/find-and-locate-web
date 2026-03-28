import { useState, useEffect } from 'react';

interface GeoState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
  denied: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    error: null,
    loading: true,
    denied: false,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        lat: null,
        lng: null,
        error: 'เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง',
        loading: false,
        denied: true,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
          loading: false,
          denied: false,
        });
      },
      (err) => {
        setState({
          lat: null,
          lng: null,
          error:
            err.code === 1
              ? 'กรุณาอนุญาตการเข้าถึงตำแหน่งเพื่อค้นหาร้านค้าใกล้คุณ'
              : 'ไม่สามารถระบุตำแหน่งได้ กรุณาลองใหม่อีกครั้ง',
          loading: false,
          denied: true,
        });
      },
      { timeout: 5000 }
    );
  }, []);

  return state;
}
