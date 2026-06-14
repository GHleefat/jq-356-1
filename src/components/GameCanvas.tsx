import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { SceneManager } from '../game/SceneManager';
import { PlayerController } from '../game/PlayerController';
import { generateMaze } from '../game/MazeGenerator';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneManager | null>(null);
  const playerRef = useRef<PlayerController | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const status = useGameStore((s) => s.status);
  const difficulty = useGameStore((s) => s.difficulty);
  const setMaze = useGameStore((s) => s.setMaze);
  const setPlayerInfo = useGameStore((s) => s.setPlayerInfo);
  const setStatus = useGameStore((s) => s.setStatus);
  const maze = useGameStore((s) => s.maze);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new SceneManager(canvasRef.current);
    sceneRef.current = scene;

    return () => {
      cancelAnimationFrame(rafRef.current);
      playerRef.current?.unbind(canvasRef.current!);
      scene.dispose();
    };
  }, []);

  useEffect(() => {
    if (status === 'playing' && sceneRef.current && !maze) {
      const newMaze = generateMaze(difficulty);
      setMaze(newMaze);
      sceneRef.current.buildMaze(newMaze);

      const player = new PlayerController({
        camera: sceneRef.current.camera,
        maze: newMaze,
        onFloorChange: () => {},
        onExitReached: () => {
          setStatus('won');
        },
        onPlayerMove: (cellX, cellZ, floor, yaw) => {
          setPlayerInfo({ cellX, cellZ, floor, yaw });
        },
      });
      playerRef.current = player;
      player.bind(canvasRef.current!);
      setPlayerInfo({
        cellX: newMaze.playerPos.x,
        cellZ: newMaze.playerPos.z,
        floor: newMaze.playerPos.floor,
        yaw: 0,
      });

      const animate = (time: number) => {
        rafRef.current = requestAnimationFrame(animate);
        const delta = Math.min((time - lastTimeRef.current) / 1000, 0.1);
        lastTimeRef.current = time;

        if (playerRef.current && sceneRef.current && useGameStore.getState().status === 'playing') {
          playerRef.current.update(delta, sceneRef.current.spotlight);
        }
        sceneRef.current?.render();
      };
      lastTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(animate);
    } else if (status === 'menu' && maze) {
      cancelAnimationFrame(rafRef.current);
      playerRef.current?.unbind(canvasRef.current!);
      playerRef.current = null;
    }

    return () => {
      if (status === 'menu') {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [status, maze, difficulty, setMaze, setPlayerInfo, setStatus]);

  useEffect(() => {
    if (status === 'playing' && sceneRef.current && maze) {
      const animate = (time: number) => {
        rafRef.current = requestAnimationFrame(animate);
        const delta = Math.min((time - lastTimeRef.current) / 1000, 0.1);
        lastTimeRef.current = time;

        if (playerRef.current && sceneRef.current && useGameStore.getState().status === 'playing') {
          playerRef.current.update(delta, sceneRef.current.spotlight);
        }
        sceneRef.current?.render();
      };
      lastTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(rafRef.current);
      };
    }
  }, [status, maze]);

  const showCanvas = status === 'playing' || status === 'won';

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${showCanvas ? 'block' : 'hidden'}`}
      style={{ touchAction: 'none' }}
    />
  );
};
