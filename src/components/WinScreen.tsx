import React, { useEffect } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { formatTime } from '../hooks/useTimer';
import { Trophy, RotateCcw, Home } from 'lucide-react';

export const WinScreen: React.FC = () => {
  const status = useGameStore((s) => s.status);
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const bestTime = useGameStore((s) => s.bestTime);
  const setBestTime = useGameStore((s) => s.setBestTime);
  const setStatus = useGameStore((s) => s.setStatus);
  const resetGame = useGameStore((s) => s.resetGame);

  const isNewRecord = !bestTime || elapsedTime < bestTime;

  useEffect(() => {
    if (status === 'won' && isNewRecord) {
      setBestTime(elapsedTime);
    }
  }, [status, isNewRecord, elapsedTime, setBestTime]);

  if (status !== 'won') return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border border-amber-500/30 shadow-2xl max-w-sm w-full mx-6 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
               style={{
                 background: 'linear-gradient(135deg, #d4a017 0%, #f5d76e 100%)',
                 boxShadow: '0 0 60px rgba(212, 160, 23, 0.5)',
               }}>
            <Trophy className="w-10 h-10 text-slate-900" strokeWidth={2.5} />
          </div>

          <h2
            className="text-4xl font-black tracking-widest text-transparent bg-clip-text mb-2"
            style={{
              backgroundImage: 'linear-gradient(135deg, #d4a017, #f5d76e)',
            }}
          >
            通 关
          </h2>
          {isNewRecord && (
            <div className="text-emerald-400 text-sm font-bold tracking-wider animate-pulse">
              ★ 新记录 ★
            </div>
          )}
        </div>

        <div className="bg-slate-950/50 rounded-xl p-5 mb-6 border border-slate-700/50">
          <div className="text-slate-400 text-xs tracking-widest mb-1">通关用时</div>
          <div className="text-white text-5xl font-mono font-bold tracking-wider">
            {formatTime(elapsedTime)}
          </div>
          {bestTime && bestTime > 0 && (
            <div className="text-slate-500 text-sm mt-2 font-mono">
              最佳记录: {formatTime(Math.min(bestTime, elapsedTime))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              resetGame();
            }}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all duration-200 border border-slate-700 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            主菜单
          </button>
          <button
            onClick={() => {
              useGameStore.setState({ maze: null, elapsedTime: 0 });
              setStatus('playing');
            }}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-900 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #d4a017, #f5d76e)',
            }}
          >
            <RotateCcw className="w-4 h-4" />
            再来一局
          </button>
        </div>
      </div>
    </div>
  );
};
