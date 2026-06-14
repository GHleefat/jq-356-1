export enum CellType {
  FLOOR = 'floor',
  WALL = 'wall',
  STAIRS_UP = 'stairs_up',
  STAIRS_DOWN = 'stairs_down',
  EXIT = 'exit',
  START = 'start',
}

export interface CellWalls {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

export interface Cell {
  x: number;
  z: number;
  type: CellType;
  walls: CellWalls;
  connectsTo?: { floor: number; x: number; z: number };
}

export interface MazeFloor {
  level: number;
  width: number;
  depth: number;
  cells: Cell[][];
  startPos: { x: number; z: number };
}

export interface Maze {
  floors: MazeFloor[];
  currentFloor: number;
  playerPos: { x: number; z: number; floor: number };
  exitPos: { x: number; z: number; floor: number };
}

export type Difficulty = 'easy' | 'normal' | 'hard';

export type GameStatus = 'menu' | 'playing' | 'won';

export interface DifficultyConfig {
  floors: number;
  width: number;
  depth: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: { floors: 2, width: 7, depth: 7 },
  normal: { floors: 3, width: 9, depth: 9 },
  hard: { floors: 4, width: 11, depth: 11 },
};

export const CELL_SIZE = 4;
export const FLOOR_HEIGHT = 6;
