import * as THREE from 'three';
import { CELL_SIZE, Maze, CellType } from './types';

export interface PlayerState {
  position: THREE.Vector3;
  yaw: number;
  pitch: number;
  floor: number;
}

interface PlayerControllerOptions {
  camera: THREE.PerspectiveCamera;
  maze: Maze;
  onFloorChange: (newFloor: number) => void;
  onExitReached: () => void;
  onPlayerMove: (cellX: number, cellZ: number, floor: number, yaw: number) => void;
}

export class PlayerController {
  private camera: THREE.PerspectiveCamera;
  private maze: Maze;
  private keys: Set<string> = new Set();
  private yaw = 0;
  private pitch = 0;
  private velocity = new THREE.Vector3();
  private onFloorChange: (newFloor: number) => void;
  private onExitReached: () => void;
  private onPlayerMove: (cellX: number, cellZ: number, floor: number, yaw: number) => void;
  private isLocked = false;
  private lastStairTime = 0;
  private readonly moveSpeed = 6;
  private readonly lookSpeed = 0.002;
  private readonly playerRadius = 0.4;

  constructor(options: PlayerControllerOptions) {
    this.camera = options.camera;
    this.maze = options.maze;
    this.onFloorChange = options.onFloorChange;
    this.onExitReached = options.onExitReached;
    this.onPlayerMove = options.onPlayerMove;

    const startPos = this.maze.playerPos;
    this.camera.position.set(
      startPos.x * CELL_SIZE + CELL_SIZE / 2,
      1.7,
      startPos.z * CELL_SIZE + CELL_SIZE / 2
    );
  }

  bind(canvas: HTMLCanvasElement): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    canvas.addEventListener('click', this.handleClick);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
  }

  unbind(canvas: HTMLCanvasElement): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    canvas.removeEventListener('click', this.handleClick);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  private handleClick = (): void => {
    if (!this.isLocked) {
      (document.querySelector('canvas') as HTMLCanvasElement)?.requestPointerLock();
    }
  };

  private handlePointerLockChange = (): void => {
    this.isLocked = document.pointerLockElement !== null;
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.code);
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isLocked) return;
    this.yaw -= e.movementX * this.lookSpeed;
    this.pitch -= e.movementY * this.lookSpeed;
    this.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.pitch));
  };

  private getCellAt(worldX: number, worldZ: number, floor: number): { x: number; z: number } {
    return {
      x: Math.floor(worldX / CELL_SIZE),
      z: Math.floor(worldZ / CELL_SIZE),
    };
  }

  private isWall(cellX: number, cellZ: number, floor: number): boolean {
    const mazeFloor = this.maze.floors[floor];
    if (!mazeFloor) return true;
    if (cellX < 0 || cellX >= mazeFloor.width || cellZ < 0 || cellZ >= mazeFloor.depth) {
      return true;
    }
    const cell = mazeFloor.cells[cellZ]?.[cellX];
    return !cell || cell.type === CellType.WALL;
  }

  private checkCollision(px: number, pz: number, floor: number): boolean {
    const offsets = [
      [-this.playerRadius, -this.playerRadius],
      [this.playerRadius, -this.playerRadius],
      [-this.playerRadius, this.playerRadius],
      [this.playerRadius, this.playerRadius],
    ];

    for (const [ox, oz] of offsets) {
      const cell = this.getCellAt(px + ox, pz + oz, floor);
      if (this.isWall(cell.x, cell.z, floor)) {
        return true;
      }
    }
    return false;
  }

  private checkSpecialCell(cellX: number, cellZ: number, floor: number): void {
    const mazeFloor = this.maze.floors[floor];
    if (!mazeFloor) return;
    const cell = mazeFloor.cells[cellZ]?.[cellX];
    if (!cell) return;

    const now = Date.now();
    if (now - this.lastStairTime < 1500) return;

    if (cell.type === CellType.STAIRS_UP && cell.connectsTo) {
      this.lastStairTime = now;
      this.maze.currentFloor = cell.connectsTo.floor;
      this.maze.playerPos.floor = cell.connectsTo.floor;
      this.camera.position.x = cell.connectsTo.x * CELL_SIZE + CELL_SIZE / 2;
      this.camera.position.z = cell.connectsTo.z * CELL_SIZE + CELL_SIZE / 2;
      this.camera.position.y = 1.7 + cell.connectsTo.floor * 6;
      this.onFloorChange(cell.connectsTo.floor);
    } else if (cell.type === CellType.STAIRS_DOWN && cell.connectsTo) {
      this.lastStairTime = now;
      this.maze.currentFloor = cell.connectsTo.floor;
      this.maze.playerPos.floor = cell.connectsTo.floor;
      this.camera.position.x = cell.connectsTo.x * CELL_SIZE + CELL_SIZE / 2;
      this.camera.position.z = cell.connectsTo.z * CELL_SIZE + CELL_SIZE / 2;
      this.camera.position.y = 1.7 + cell.connectsTo.floor * 6;
      this.onFloorChange(cell.connectsTo.floor);
    } else if (cell.type === CellType.EXIT) {
      this.onExitReached();
    }
  }

  update(deltaTime: number, spotlight: THREE.SpotLight): void {
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    this.velocity.set(0, 0, 0);

    if (this.keys.has('KeyW')) this.velocity.add(forward);
    if (this.keys.has('KeyS')) this.velocity.sub(forward);
    if (this.keys.has('KeyD')) this.velocity.add(right);
    if (this.keys.has('KeyA')) this.velocity.sub(right);

    if (this.velocity.length() > 0) {
      this.velocity.normalize().multiplyScalar(this.moveSpeed * deltaTime);
    }

    const currentFloor = this.maze.currentFloor;
    let newX = this.camera.position.x + this.velocity.x;
    let newZ = this.camera.position.z + this.velocity.z;

    if (!this.checkCollision(newX, this.camera.position.z, currentFloor)) {
      this.camera.position.x = newX;
    }
    if (!this.checkCollision(this.camera.position.x, newZ, currentFloor)) {
      this.camera.position.z = newZ;
    }

    const cell = this.getCellAt(this.camera.position.x, this.camera.position.z, currentFloor);
    this.maze.playerPos.x = cell.x;
    this.maze.playerPos.z = cell.z;

    spotlight.position.copy(this.camera.position);
    const target = new THREE.Vector3();
    this.camera.getWorldDirection(target);
    spotlight.target.position.copy(this.camera.position).add(target);

    this.onPlayerMove(cell.x, cell.z, currentFloor, this.yaw);
    this.checkSpecialCell(cell.x, cell.z, currentFloor);
  }

  getState(): PlayerState {
    return {
      position: this.camera.position.clone(),
      yaw: this.yaw,
      pitch: this.pitch,
      floor: this.maze.currentFloor,
    };
  }
}
