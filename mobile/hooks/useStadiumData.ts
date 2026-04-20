import { useState, useEffect } from 'react';

export interface Concession {
  id: string;
  name: string;
  waitTime: number;
  distance: number;
  popularity: number;
}

export const useStadiumData = () => {
  const [concessions, setConcessions] = useState<Concession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial fetch
    const timer = setTimeout(() => {
      setConcessions([
        { id: '1', name: 'Prime Pit BBQ', waitTime: 4, distance: 20, popularity: 0.8 },
        { id: '2', name: 'Stadium Brews', waitTime: 12, distance: 45, popularity: 0.6 },
        { id: '3', name: 'Nacho Nation', waitTime: 2, distance: 150, popularity: 0.3 },
        { id: '4', name: 'Goal Post Grill', waitTime: 25, distance: 80, popularity: 0.95 },
      ]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { concessions, loading };
};
