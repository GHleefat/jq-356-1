import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "../hooks/useGameStore";
import { CellType } from "../game/types";

const CELL_PX = 12;

export const MiniMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maze = useGameStore((s) => s.maze);
  const playerInfo = useGameStore((s) => s.playerInfo);
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      setPulsePhase((prev) => (prev + 0.08) % (Math.PI * 2));
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !maze) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentFloor = maze.floors[playerInfo.floor];
    if (!currentFloor) return;

    const w = currentFloor.width * CELL_PX;
    const h = currentFloor.depth * CELL_PX;
    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, w, h);

    for (let z = 0; z < currentFloor.depth; z++) {
      for (let x = 0; x < currentFloor.width; x++) {
        const cell = currentFloor.cells[z][x];
        const px = x * CELL_PX;
        const pz = z * CELL_PX;

        if (cell.type === CellType.WALL) {
          ctx.fillStyle = "#2d3436";
        } else if (
          cell.type === CellType.STAIRS_UP ||
          cell.type === CellType.STAIRS_DOWN
        ) {
          ctx.fillStyle = "#00b894";
        } else if (cell.type === CellType.EXIT) {
          ctx.fillStyle = "#0984e3";
        } else if (cell.type === CellType.START) {
          ctx.fillStyle = "#d4a017";
        } else {
          ctx.fillStyle = "#4a4a5a";
        }
        ctx.fillRect(px + 1, pz + 1, CELL_PX - 2, CELL_PX - 2);

        ctx.strokeStyle = "#1a1a2e";
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

    const exitX = maze.exitPos.x;
    const exitZ = maze.exitPos.z;
    const exitFloor = maze.exitPos.floor;
    const isSameFloor = playerInfo.floor === exitFloor;

    if (!isSameFloor) {
      const dx = exitX - playerInfo.cellX;
      const dz = exitZ - playerInfo.cellZ;
      const angle = Math.atan2(dz, dx);

      const arrowDist = Math.min(w, h) * 0.35 + Math.sin(pulsePhase) * 3;
      const arrowX = w / 2 + Math.cos(angle) * arrowDist;
      const arrowY = h / 2 + Math.sin(angle) * arrowDist;

      const arrowAngle = angle + Math.PI / 2;

      ctx.save();
      ctx.translate(arrowX, arrowY);
      ctx.rotate(arrowAngle);

      const glowAlpha = 0.3 + Math.sin(pulsePhase) * 0.2;
      ctx.shadowColor = "#0984e3";
      ctx.shadowBlur = 15 + Math.sin(pulsePhase) * 5;

      ctx.fillStyle = `rgba(9, 132, 227, ${0.6 + glowAlpha})`;
      ctx.beginPath();
      ctx.moveTo(0, -CELL_PX * 0.9);
      ctx.lineTo(-CELL_PX * 0.6, CELL_PX * 0.6);
      ctx.lineTo(0, CELL_PX * 0.3);
      ctx.lineTo(CELL_PX * 0.6, CELL_PX * 0.6);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      ctx.save();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#74b9ff";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const floorDiff = exitFloor - playerInfo.floor;
      const indicatorText =
        floorDiff > 0 ? `↑${floorDiff}层` : `↓${Math.abs(floorDiff)}层`;
      ctx.fillText(indicatorText, w / 2, h / 2 - CELL_PX * 1.2);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(playerPx, playerPz);
    ctx.rotate(-playerInfo.yaw);

    ctx.fillStyle = "#ff6b6b";
    ctx.shadowColor = "#ff6b6b";
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(0, -CELL_PX * 0.6);
    ctx.lineTo(-CELL_PX * 0.4, CELL_PX * 0.5);
    ctx.lineTo(CELL_PX * 0.4, CELL_PX * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    ctx.strokeStyle = "#d4a017";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
  }, [maze, playerInfo, pulsePhase]);

  if (!maze) return null;

  const exitFloor = maze.exitPos.floor;
  const floorDiff = exitFloor - playerInfo.floor;
  const floorIndicator =
    floorDiff === 0
      ? "出口就在本层！"
      : floorDiff > 0
        ? `出口在上方 ${floorDiff} 层`
        : `出口在下方 ${Math.abs(floorDiff)} 层`;

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-amber-500/30 shadow-2xl">
        <div className="text-amber-400 text-xs font-bold mb-1 text-center tracking-wider">
          第 {playerInfo.floor + 1} 层 / 共 {maze.floors.length} 层
        </div>
        <div
          className={`text-[10px] mb-2 text-center font-bold tracking-wide ${
            floorDiff === 0 ? "text-blue-400" : "text-slate-300"
          }`}
        >
          {floorDiff === 0 ? "🎯 " : floorDiff > 0 ? "⬆ " : "⬇ "}
          {floorIndicator}
        </div>
        <canvas
          ref={canvasRef}
          className="block rounded"
          style={{ imageRendering: "pixelated" }}
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
            <span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />你
          </span>
        </div>
      </div>
    </div>
  );
};
