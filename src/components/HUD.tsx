import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { formatTime, useTimer } from '../hooks/useTimer';
import { MiniMap } from './MiniMap';

export const HUD: React.FC = () => {
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const bestTime = useGameStore((s) => s.bestTime);
  const status = useGameStore((s) => s.status);
  useTimer();

  if (status !== 'playing') return null;

  return (
    <>
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-5 py-3 border border-amber-500/30 shadow-2xl">
          <div className="text-amber-400 text-xs font-mono tracking-widest mb-1">
            计时
          </div>
          <div className="text-white text-3xl font-mono font-bold tracking-wider">
            {formatTime(elapsedTime)}
          </div>
          {bestTime && bestTime > 0 && (
            <div className="text-slate-400 text-xs mt-1 font-mono">
              最佳: {formatTime(bestTime)}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-slate-900/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-600/30">
          <div className="text-slate-300 text-xs font-mono tracking-wide text-center">
            <span className="text-amber-400">WASD</span> 移动 &nbsp;·&nbsp;
            <span className="text-amber-400">鼠标</span> 视角 &nbsp;·&nbsp;
            <span className="text-emerald-400">踩楼梯</span> 切换楼层 &nbsp;·&nbsp;
            <span className="text-blue-400">找到蓝色出口</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-5 h-0.5 bg-white/60 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-0.5 h-5 bg-white/60 absolute -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      <MiniMap />
    </>
  );
};
