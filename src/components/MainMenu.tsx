import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { Difficulty, DIFFICULTY_CONFIG } from '../game/types';
import { formatTime } from '../hooks/useTimer';

const difficultyLabels: Record<Difficulty, { name: string; desc: string }> = {
  easy: { name: '简单', desc: '2层 · 7×7' },
  normal: { name: '普通', desc: '3层 · 9×9' },
  hard: { name: '困难', desc: '4层 · 11×11' },
};

export const MainMenu: React.FC = () => {
  const status = useGameStore((s) => s.status);
  const difficulty = useGameStore((s) => s.difficulty);
  const bestTime = useGameStore((s) => s.bestTime);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const setStatus = useGameStore((s) => s.setStatus);

  if (status !== 'menu') return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(212, 160, 23, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(9, 132, 227, 0.3) 0%, transparent 40%)
          `,
        }}
      />

      <div className="relative w-full max-w-md mx-auto px-6">
        <div className="text-center mb-10">
          <h1
            className="text-6xl font-black tracking-widest text-transparent bg-clip-text mb-3"
            style={{
              backgroundImage: 'linear-gradient(135deg, #d4a017 0%, #f5d76e 50%, #d4a017 100%)',
              fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
              textShadow: '0 0 40px rgba(212, 160, 23, 0.5)',
            }}
          >
            迷宫
          </h1>
          <p className="text-slate-400 text-lg tracking-wider">
            立体迷宫 · 第一人称探险
          </p>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
          <div className="mb-6">
            <div className="text-slate-400 text-sm mb-3 text-center tracking-wider">
              选择难度
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(difficultyLabels) as Difficulty[]).map((d) => {
                const active = difficulty === d;
                return (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-3 px-2 rounded-xl transition-all duration-300 border ${
                      active
                        ? 'bg-gradient-to-b from-amber-500/20 to-amber-600/10 border-amber-500/60 text-amber-300 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-bold text-sm">{difficultyLabels[d].name}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">
                      {DIFFICULTY_CONFIG[d].floors}层 · {DIFFICULTY_CONFIG[d].width}×{DIFFICULTY_CONFIG[d].depth}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setStatus('playing')}
            className="w-full py-4 px-6 rounded-xl font-bold text-lg tracking-widest text-slate-900 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #d4a017 0%, #f5d76e 50%, #d4a017 100%)',
              boxShadow: '0 8px 32px rgba(212, 160, 23, 0.4)',
            }}
          >
            开 始 游 戏
          </button>

          {bestTime && bestTime > 0 && (
            <div className="mt-5 text-center">
              <span className="text-slate-500 text-sm">最佳记录: </span>
              <span className="text-emerald-400 font-mono font-bold text-sm">
                {formatTime(bestTime)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-slate-500 text-xs space-y-2">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700 font-mono">WASD</kbd>
              <span className="ml-1">移动</span>
            </span>
            <span>
              <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700 font-mono">鼠标</kbd>
              <span className="ml-1">视角</span>
            </span>
            <span>
              <span className="inline-block w-3 h-3 bg-emerald-500 rounded-sm align-middle" />
              <span className="ml-1">楼梯</span>
            </span>
            <span>
              <span className="inline-block w-3 h-3 bg-blue-500 rounded-sm align-middle" />
              <span className="ml-1">出口</span>
            </span>
          </div>
          <p className="opacity-60">点击画面锁定鼠标 · ESC 释放</p>
        </div>
      </div>
    </div>
  );
};
