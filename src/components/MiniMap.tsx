import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { CellType } from '../game/types';

const CELL_PX = 12;

export const MiniMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maze = useGameStore((s) => s.maze);
  const playerInfo = useGameStore((s) => s.playerInfo);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !maze) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentFloor = maze.floors[playerInfo.floor];
    if (!currentFloor) return;

    const w = currentFloor.width * CELL_PX;
    const h = currentFloor.depth * CELL_PX;
    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    for (let z = 0; z < currentFloor.depth; z++) {
      for (let x = 0; x < currentFloor.width; x++) {
        const cell = currentFloor.cells[z][x];
        const px = x * CELL_PX;
        const pz = z * CELL_PX;

        if (cell.type === CellType.WALL) {
          ctx.fillStyle = '#2d3436';
        } else if (cell.type === CellType.STAIRS_UP || cell.type === CellType.STAIRS_DOWN) {
          ctx.fillStyle = '#00b894';
        } else if (cell.type === CellType.EXIT) {
          ctx.fillStyle = '#0984e3';
        } else if (cell.type === CellType.START) {
          ctx.fillStyle = '#d4a017';
        } else {
          ctx.fillStyle = '#4a4a5a';
        }
        ctx.fillRect(px + 1, pz + 1, CELL_PX - 2, CELL_PX - 2);

        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 1;
        if (cell.walls.north) {
          ctx.beginPath();
          ctx.moveTo(px, pz);
          ctx.lineTo(px + CELL_PX, pz);
          ctx.stroke();
        }
        if (cell.walls.south) {
          ctx.beginPath();
          ctx.moveTo(px, pz + CELL_PX);
          ctx.lineTo(px + CELL_PX, pz + CELL_PX);
          ctx.stroke();
        }
        if (cell.walls.west) {
          ctx.beginPath();
          ctx.moveTo(px, pz);
          ctx.lineTo(px, pz + CELL_PX);
          ctx.stroke();
        }
        if (cell.walls.east) {
          ctx.beginPath();
          ctx.moveTo(px + CELL_PX, pz);
          ctx.lineTo(px + CELL_PX, pz + CELL_PX);
          ctx.stroke();
        }
      }
    }

    const playerPx = playerInfo.cellX * CELL_PX + CELL_PX / 2;
    const playerPz = playerInfo.cellZ * CELL_PX + CELL_PX / 2;

    ctx.save();
    ctx.translate(playerPx, playerPz);
    ctx.rotate(-playerInfo.yaw);

    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(0, -CELL_PX * 0.6);
    ctx.lineTo(-CELL_PX * 0.4, CELL_PX * 0.5);
    ctx.lineTo(CELL_PX * 0.4, CELL_PX * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    ctx.strokeStyle = '#d4a017';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
  }, [maze, playerInfo]);

  if (!maze) return null;

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-amber-500/30 shadow-2xl">
        <div className="text-amber-400 text-xs font-bold mb-2 text-center tracking-wider">
          第 {playerInfo.floor + 1} 层 / 共 {maze.floors.length} 层
        </div>
        <canvas
          ref={canvasRef}
          className="block rounded"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="flex gap-3 mt-2 text-[10px] justify-center">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />
            楼梯
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />
            出口
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />
            你
          </span>
        </div>
      </div>
    </div>
  );
};
