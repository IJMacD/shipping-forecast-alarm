import { useEffect, useState } from 'react';

export function useNow (interval = 1000) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, []);

  return now;
}
