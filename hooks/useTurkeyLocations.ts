import { useEffect, useState } from 'react';

export interface Province {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
}

const API_BASE = 'https://api.turkiyeapi.dev/v2';

export function useProvinces() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/provinces?fields=id,name&sort=name`)
      .then(res => res.json())
      .then(json => setProvinces(json.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { provinces, loading };
}

export function useDistricts(provinceId: number | null) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!provinceId) {
      setDistricts([]);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/districts?provinceId=${provinceId}&fields=id,name&sort=name`)
      .then(res => res.json())
      .then(json => setDistricts(json.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [provinceId]);

  return { districts, loading };
}