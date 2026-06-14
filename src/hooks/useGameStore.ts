import { create } from 'zustand';
import { Difficulty, GameStatus, Maze } from '../game/types';

interface PlayerInfo {
  cellX: number;
  cellZ: number;
  floor: number;
  yaw: number;
}

interface GameState {
  status: GameStatus;
  difficulty: Difficulty;
  maze: Maze | null;
  playerInfo: PlayerInfo;
  elapsedTime: number;
  bestTime: number | null;

  setStatus: (status: GameStatus) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setMaze: (maze: Maze) => void;
  setPlayerInfo: (info: PlayerInfo) => void;
  setElapsedTime: (time: number) => void;
  setBestTime: (time: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  status: 'menu',
  difficulty: 'normal',
  maze: null,
  playerInfo: { cellX: 0, cellZ: 0, floor: 0, yaw: 0 },
  elapsedTime: 0,
  bestTime: typeof window !== 'undefined' ? Number(localStorage.getItem('maze_best_time') || '0') || null : null,

  setStatus: (status) => set({ status }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setMaze: (maze) => set({ maze }),
  setPlayerInfo: (playerInfo) => set({ playerInfo }),
  setElapsedTime: (elapsedTime) => set({ elapsedTime }),
  setBestTime: (time) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('maze_best_time', String(time));
    }
    set({ bestTime: time });
  },
  resetGame: () =>
    set({
      status: 'menu',
      maze: null,
      playerInfo: { cellX: 0, cellZ: 0, floor: 0, yaw: 0 },
      elapsedTime: 0,
    }),
}));
