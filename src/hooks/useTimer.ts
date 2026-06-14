import { useEffect, useRef } from 'react';
import { useGameStore } from './useGameStore';

export function useTimer() {
  const status = useGameStore((s) => s.status);
  const setElapsedTime = useGameStore((s) => s.setElapsedTime);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (status === 'playing') {
      startTimeRef.current = performance.now() - useGameStore.getState().elapsedTime * 1000;

      const tick = () => {
        const elapsed = (performance.now() - startTimeRef.current) / 1000;
        setElapsedTime(elapsed);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(rafRef.current);
      };
    }
  }, [status, setElapsedTime]);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}
