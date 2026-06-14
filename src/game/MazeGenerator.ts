import {
  Cell,
  CellType,
  CellWalls,
  Difficulty,
  DIFFICULTY_CONFIG,
  Maze,
  MazeFloor,
} from './types';

function createEmptyCells(width: number, depth: number): Cell[][] {
  const cells: Cell[][] = [];
  for (let z = 0; z < depth; z++) {
    cells[z] = [];
    for (let x = 0; x < width; x++) {
      cells[z][x] = {
        x,
        z,
        type: CellType.WALL,
        walls: { north: true, south: true, east: true, west: true },
      };
    }
  }
  return cells;
}

function generateSingleFloor(width: number, depth: number, level: number): MazeFloor {
  const cells = createEmptyCells(width, depth);
  const visited: boolean[][] = Array(depth)
    .fill(null)
    .map(() => Array(width).fill(false));

  const stack: { x: number; z: number }[] = [];
  const startX = Math.floor(width / 2);
  const startZ = Math.floor(depth / 2);

  cells[startZ][startX].type = CellType.FLOOR;
  visited[startZ][startX] = true;
  stack.push({ x: startX, z: startZ });

  const directions: {
    dx: number;
    dz: number;
    wall: keyof CellWalls;
    opposite: keyof CellWalls;
  }[] = [
    { dx: 0, dz: -1, wall: 'north', opposite: 'south' },
    { dx: 0, dz: 1, wall: 'south', opposite: 'north' },
    { dx: 1, dz: 0, wall: 'east', opposite: 'west' },
    { dx: -1, dz: 0, wall: 'west', opposite: 'east' },
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors: {
      x: number;
      z: number;
      dx: number;
      dz: number;
      wall: keyof CellWalls;
      opposite: keyof CellWalls;
    }[] = [];

    for (const dir of directions) {
      const nx = current.x + dir.dx * 2;
      const nz = current.z + dir.dz * 2;
      if (nx >= 0 && nx < width && nz >= 0 && nz < depth && !visited[nz][nx]) {
        neighbors.push({ x: nx, z: nz, ...dir });
      }
    }

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
    const midX = current.x + next.dx;
    const midZ = current.z + next.dz;

    cells[midZ][midX].type = CellType.FLOOR;
    cells[midZ][midX].walls = { north: false, south: false, east: false, west: false };
    cells[next.z][next.x].type = CellType.FLOOR;

    cells[current.z][current.x].walls[next.wall] = false;
    cells[midZ][midX].walls[next.wall] = false;
    cells[midZ][midX].walls[next.opposite] = false;
    cells[next.z][next.x].walls[next.opposite] = false;

    visited[next.z][next.x] = true;
    stack.push({ x: next.x, z: next.z });
  }

  return {
    level,
    width,
    depth,
    cells,
    startPos: { x: startX, z: startZ },
  };
}

function findFloorCells(floor: MazeFloor): { x: number; z: number }[] {
  const result: { x: number; z: number }[] = [];
  for (let z = 0; z < floor.depth; z++) {
    for (let x = 0; x < floor.width; x++) {
      if (floor.cells[z][x].type === CellType.FLOOR) {
        result.push({ x, z });
      }
    }
  }
  return result;
}

function getDistance(
  a: { x: number; z: number },
  b: { x: number; z: number }
): number {
  return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
}

export function generateMaze(difficulty: Difficulty): Maze {
  const config = DIFFICULTY_CONFIG[difficulty];
  const floors: MazeFloor[] = [];

  for (let i = 0; i < config.floors; i++) {
    floors.push(generateSingleFloor(config.width, config.depth, i));
  }

  for (let i = 0; i < config.floors - 1; i++) {
    const currentFloor = floors[i];
    const nextFloor = floors[i + 1];

    const currentFloorCells = findFloorCells(currentFloor);
    const nextFloorCells = findFloorCells(nextFloor);

    const stairUp =
      currentFloorCells[Math.floor(Math.random() * currentFloorCells.length)];
    const stairDown =
      nextFloorCells[Math.floor(Math.random() * nextFloorCells.length)];

    currentFloor.cells[stairUp.z][stairUp.x].type = CellType.STAIRS_UP;
    currentFloor.cells[stairUp.z][stairUp.x].connectsTo = {
      floor: i + 1,
      x: stairDown.x,
      z: stairDown.z,
    };

    nextFloor.cells[stairDown.z][stairDown.x].type = CellType.STAIRS_DOWN;
    nextFloor.cells[stairDown.z][stairDown.x].connectsTo = {
      floor: i,
      x: stairUp.x,
      z: stairUp.z,
    };
  }

  const lastFloor = floors[floors.length - 1];
  const lastFloorCells = findFloorCells(lastFloor);
  let exitPos = lastFloorCells[0];
  let maxDist = 0;

  for (const cell of lastFloorCells) {
    const dist = getDistance(cell, lastFloor.startPos);
    if (dist > maxDist) {
      maxDist = dist;
      exitPos = cell;
    }
  }

  lastFloor.cells[exitPos.z][exitPos.x].type = CellType.EXIT;

  const firstFloor = floors[0];
  firstFloor.cells[firstFloor.startPos.z][firstFloor.startPos.x].type =
    CellType.START;

  return {
    floors,
    currentFloor: 0,
    playerPos: {
      x: firstFloor.startPos.x,
      z: firstFloor.startPos.z,
      floor: 0,
    },
    exitPos: { x: exitPos.x, z: exitPos.z, floor: floors.length - 1 },
  };
}
