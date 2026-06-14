import * as THREE from 'three';
import { CELL_SIZE, FLOOR_HEIGHT, CellType, Maze, MazeFloor } from './types';

export class SceneManager {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  spotlight: THREE.SpotLight;
  private mazeGroup: THREE.Group;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);
    this.scene.fog = new THREE.Fog(0x0a0a0f, 5, 35);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.mazeGroup = new THREE.Group();
    this.scene.add(this.mazeGroup);

    const ambientLight = new THREE.AmbientLight(0x404050, 0.4);
    this.scene.add(ambientLight);

    this.spotlight = new THREE.SpotLight(0xfff4e0, 3, 30, Math.PI / 4, 0.4, 1);
    this.spotlight.castShadow = true;
    this.spotlight.shadow.mapSize.set(1024, 1024);
    this.scene.add(this.spotlight);
    this.scene.add(this.spotlight.target);

    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private createWallMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x3a3a4a,
      roughness: 0.85,
      metalness: 0.15,
    });
  }

  private createFloorMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x2a2a35,
      roughness: 0.95,
      metalness: 0.05,
    });
  }

  private createStairsMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x00b894,
      roughness: 0.6,
      metalness: 0.3,
      emissive: 0x00b894,
      emissiveIntensity: 0.2,
    });
  }

  private createExitMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x0984e3,
      roughness: 0.5,
      metalness: 0.4,
      emissive: 0x0984e3,
      emissiveIntensity: 0.5,
    });
  }

  private buildFloor(floorData: MazeFloor): void {
    const floorGroup = new THREE.Group();
    const yOffset = floorData.level * FLOOR_HEIGHT;

    const wallMaterial = this.createWallMaterial();
    const floorMaterial = this.createFloorMaterial();
    const stairsMaterial = this.createStairsMaterial();
    const exitMaterial = this.createExitMaterial();

    const wallHeight = FLOOR_HEIGHT - 0.5;
    const wallThickness = 0.3;

    for (let z = 0; z < floorData.depth; z++) {
      for (let x = 0; x < floorData.width; x++) {
        const cell = floorData.cells[z][x];
        if (cell.type === CellType.WALL) continue;

        const wx = x * CELL_SIZE + CELL_SIZE / 2;
        const wz = z * CELL_SIZE + CELL_SIZE / 2;

        const floorGeo = new THREE.BoxGeometry(CELL_SIZE, 0.2, CELL_SIZE);
        const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
        floorMesh.position.set(wx, yOffset, wz);
        floorMesh.receiveShadow = true;
        floorGroup.add(floorMesh);

        const ceilGeo = new THREE.BoxGeometry(CELL_SIZE, 0.2, CELL_SIZE);
        const ceilMesh = new THREE.Mesh(ceilGeo, floorMaterial);
        ceilMesh.position.set(wx, yOffset + wallHeight, wz);
        ceilMesh.receiveShadow = true;
        floorGroup.add(ceilMesh);

        if (cell.type === CellType.STAIRS_UP || cell.type === CellType.STAIRS_DOWN) {
          const stairGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 8);
          const stairMesh = new THREE.Mesh(stairGeo, stairsMaterial);
          stairMesh.position.set(wx, yOffset + 0.3, wz);
          floorGroup.add(stairMesh);

          const arrowShape = new THREE.TorusGeometry(0.5, 0.08, 8, 16);
          const arrowMesh = new THREE.Mesh(arrowShape, stairsMaterial);
          arrowMesh.position.set(wx, yOffset + 0.6, wz);
          arrowMesh.rotation.x = Math.PI / 2;
          floorGroup.add(arrowMesh);
        }

        if (cell.type === CellType.EXIT) {
          const exitGeo = new THREE.BoxGeometry(2, 2.5, 0.2);
          const exitMesh = new THREE.Mesh(exitGeo, exitMaterial);
          exitMesh.position.set(wx, yOffset + 1.4, wz);
          floorGroup.add(exitMesh);

          const pointLight = new THREE.PointLight(0x0984e3, 2, 8);
          pointLight.position.set(wx, yOffset + 1.5, wz);
          floorGroup.add(pointLight);
        }

        if (cell.walls.north) {
          const wallGeo = new THREE.BoxGeometry(CELL_SIZE, wallHeight, wallThickness);
          const wall = new THREE.Mesh(wallGeo, wallMaterial);
          wall.position.set(wx, yOffset + wallHeight / 2, wz - CELL_SIZE / 2);
          wall.castShadow = true;
          wall.receiveShadow = true;
          floorGroup.add(wall);
        }
        if (cell.walls.south) {
          const wallGeo = new THREE.BoxGeometry(CELL_SIZE, wallHeight, wallThickness);
          const wall = new THREE.Mesh(wallGeo, wallMaterial);
          wall.position.set(wx, yOffset + wallHeight / 2, wz + CELL_SIZE / 2);
          wall.castShadow = true;
          wall.receiveShadow = true;
          floorGroup.add(wall);
        }
        if (cell.walls.west) {
          const wallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, CELL_SIZE);
          const wall = new THREE.Mesh(wallGeo, wallMaterial);
          wall.position.set(wx - CELL_SIZE / 2, yOffset + wallHeight / 2, wz);
          wall.castShadow = true;
          wall.receiveShadow = true;
          floorGroup.add(wall);
        }
        if (cell.walls.east) {
          const wallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, CELL_SIZE);
          const wall = new THREE.Mesh(wallGeo, wallMaterial);
          wall.position.set(wx + CELL_SIZE / 2, yOffset + wallHeight / 2, wz);
          wall.castShadow = true;
          wall.receiveShadow = true;
          floorGroup.add(wall);
        }
      }
    }

    this.mazeGroup.add(floorGroup);
  }

  buildMaze(maze: Maze): void {
    while (this.mazeGroup.children.length > 0) {
      const child = this.mazeGroup.children[0];
      this.mazeGroup.remove(child);
    }

    for (const floor of maze.floors) {
      this.buildFloor(floor);
    }
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
  }
}
