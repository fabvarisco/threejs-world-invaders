import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { Octree } from "three/addons/math/Octree.js";

import { Capsule } from "three/addons/math/Capsule.js";

import { Group, Vector3 } from "three";
import Prefab from "@/Assets/Prefabs/Prefab";
import GameObject from "@/Assets/GameObject";

class Web {
  private clock: THREE.Clock;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly fillLight1: THREE.HemisphereLight;
  private readonly directionalLight: THREE.DirectionalLight;
  private renderer: THREE.WebGLRenderer;
  private readonly GRAVITY: number;
  private readonly SPHERE_RADIUS: number;
  private readonly STEPS_PER_FRAME: number;
  private readonly sphereGeometry: THREE.IcosahedronGeometry;
  private readonly sphereMaterial: THREE.MeshLambertMaterial;
  private readonly spheres: GameObject[] = [];
  private readonly worldOctree: Octree;
  private readonly playerCollider: Capsule;
  private readonly playerVelocity: THREE.Vector3;
  private readonly playerDirection: THREE.Vector3;
  private playerOnFloor: boolean;
  private mouseTime: number;
  private readonly keyStates: { [key: string]: boolean };
  private invaderModel: Group = new Group();
  private worldWeb: Group = new Group();
  private monsters: GameObject[] = [];
  private spawnTime: number = 0.5;
  private timer: number = 0.5;

  constructor(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    prefabs: Map<string, Prefab>
  ) {
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x88ccee);
    this.scene.fog = new THREE.Fog(0x88ccee, 0, 50);
    this.camera = camera;
    this.camera.rotation.order = "YXZ";
    this.fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
    this.fillLight1.position.set(2, 1, 1);
    this.scene.add(this.fillLight1);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    this.directionalLight.position.set(-5, 25, -1);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.camera.near = 0.01;
    this.directionalLight.shadow.camera.far = 500;
    this.directionalLight.shadow.camera.right = 30;
    this.directionalLight.shadow.camera.left = -30;
    this.directionalLight.shadow.camera.top = 30;
    this.directionalLight.shadow.camera.bottom = -30;
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.radius = 4;
    this.directionalLight.shadow.bias = -0.00006;
    this.scene.add(this.directionalLight);
    this.renderer = renderer;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.GRAVITY = 30;
    this.SPHERE_RADIUS = 0.2;
    this.STEPS_PER_FRAME = 5;
    this.sphereGeometry = new THREE.IcosahedronGeometry(this.SPHERE_RADIUS, 5);
    this.sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xdede8d });
    this.spheres = [];
    this.worldOctree = new Octree();
    this.playerCollider = new Capsule(
      new THREE.Vector3(0, 0.35, 0),
      new THREE.Vector3(0, 1, 0),
      0.35
    );
    this.playerVelocity = new THREE.Vector3();
    this.playerDirection = new THREE.Vector3();
    this.playerOnFloor = false;
    this.mouseTime = 0;
    this.keyStates = {};
    document.addEventListener("keydown", (event) => {
      this.keyStates[event.code] = true;
    });
    document.addEventListener("keyup", (event) => {
      this.keyStates[event.code] = false;
    });
    document.addEventListener("mousedown", () => {
      document.body.requestPointerLock();
      this.mouseTime = performance.now();
    });
    document.addEventListener("mouseup", () => {
      if (document.pointerLockElement !== null) this.throwBall();
    });
    document.body.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement === document.body) {
        this.camera.rotation.y -= event.movementX / 500;
        this.camera.rotation.x -= event.movementY / 500;
      }
    });
    window.addEventListener("resize", this.onWindowResize);
    this.onWindowResize();

    this.invaderModel = prefabs.get("invader")?.GetObject()!;
    this.invaderModel.scale.set(1, 1, 1);
    this.worldWeb = prefabs.get("worldWeb")?.GetObject()!;

    this.scene.add(this.worldWeb);
    this.worldOctree.fromGraphNode(this.worldWeb);

    this.animate();
  }

  private spawnMonster(): void {
    const minX = -60;
    const maxX = 60;
    const minY = 100;
    const maxY = 100;
    const minZ = -60;
    const maxZ = 60;

    const position: Vector3 = new Vector3(0, 0, 0);
    position.x = Math.random() * (maxX - minX) + minX;
    position.y = Math.random() * (maxY - minY) + minY;
    position.z = Math.random() * (maxZ - minZ) + minZ;

    const newInvader = new GameObject(this.invaderModel.clone(), position);
    newInvader.DebugDrawBox3(this.scene);
    this.monsters.push(newInvader);
    this.scene.add(newInvader.GetModel());
  }

  private updateMonsters(): void {
    this.monsters.forEach((el) => {
      el.MoveTo(this.camera.position);
      el.LookTo(this.camera.position);
    });

    this.invadersCollisions();
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private throwBall(): void {
    const meshSphere = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
    meshSphere.castShadow = true;
    meshSphere.receiveShadow = true;

    const sphere = new GameObject(
      meshSphere,
      this.camera.getWorldDirection(this.playerDirection)
    );

    this.camera.getWorldDirection(this.playerDirection);
    const impulse =
      15 + 30 * (1 - Math.exp((this.mouseTime - performance.now()) * 0.001));
    sphere.SetPosition(this.playerCollider.end);
    sphere.SetVelocity(
      new Vector3(0, 0, 0).copy(
        this.camera
          .getWorldDirection(this.playerDirection)
          .clone()
          .multiplyScalar(impulse)
      )
    );

    this.spheres.push(sphere);
    this.scene.add(sphere.GetModel());
  }

  private playerCollisions(): void {
    const result = this.worldOctree.capsuleIntersect(this.playerCollider);
    this.playerOnFloor = false;
    if (result) {
      this.playerOnFloor = result.normal.y > 0;
      if (!this.playerOnFloor) {
        this.playerVelocity.addScaledVector(
          result.normal,
          -result.normal.dot(this.playerVelocity)
        );
      }
      this.playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }
  }

  private spheresCollisions(): void {
    // for (let i = 0, length = this.spheres.length; i < length; i++) {
    //   const s1 = this.spheres[i];
    //   const result = s1.IntersectBoxWith(this.worldOctree)
    //   if (result) {
    //     this.scene.remove(s1.mesh);
    //   }
    // }
  }

  private invadersCollisions(): void {
    for (let i = 0; i < this.spheres.length; i++) {
      for (let j = 0; j < this.monsters.length; j++) {
        const sphere = this.spheres[i];
        const monster = this.monsters[j];

        if (monster.IntersectBoxWith(sphere)) {
          this.scene.remove(sphere.GetModel());
          this.spheres.splice(i, 1);

          this.scene.remove(monster.GetModel());
          this.monsters.splice(j, 1);

          i--;
          j--;
        }
      }
    }
  }

  private updatePlayer(deltaTime: number): void {
    let damping = Math.exp(-4 * deltaTime) - 1;
    if (!this.playerOnFloor) {
      this.playerVelocity.y -= this.GRAVITY * deltaTime;
      damping *= 0.1;
    }
    this.playerVelocity.addScaledVector(this.playerVelocity, damping);
    const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);
    this.playerCollider.translate(deltaPosition);
    this.playerCollisions();
    this.camera.position.copy(this.playerCollider.end);
  }

  private updateSpheres(deltaTime: number): void {
    for (const sphere of this.spheres) {
      sphere.AddScalar(deltaTime);
    }
  }
  private getForwardVector(): THREE.Vector3 {
    this.camera.getWorldDirection(this.playerDirection);
    this.playerDirection.y = 0;
    this.playerDirection.normalize();
    return this.playerDirection;
  }

  private getSideVector(): THREE.Vector3 {
    this.camera.getWorldDirection(this.playerDirection);
    this.playerDirection.y = 0;
    this.playerDirection.normalize();
    this.playerDirection.cross(this.camera.up);
    return this.playerDirection;
  }

  private controls(deltaTime: number): void {
    const speedDelta = deltaTime * (this.playerOnFloor ? 25 : 8);
    if (this.keyStates["KeyW"]) {
      this.playerVelocity.add(
        this.getForwardVector().multiplyScalar(speedDelta)
      );
    }
    if (this.keyStates["KeyS"]) {
      this.playerVelocity.add(
        this.getForwardVector().multiplyScalar(-speedDelta)
      );
    }
    if (this.keyStates["KeyA"]) {
      this.playerVelocity.add(this.getSideVector().multiplyScalar(-speedDelta));
    }
    if (this.keyStates["KeyD"]) {
      this.playerVelocity.add(this.getSideVector().multiplyScalar(speedDelta));
    }
    if (this.playerOnFloor) {
      if (this.keyStates["Space"]) {
        this.playerVelocity.y = 15;
      }
    }
  }

  private teleportPlayerIfOob(): void {
    if (this.camera.position.y <= -25) {
      this.playerCollider.start.set(0, 0.35, 0);
      this.playerCollider.end.set(0, 1, 0);
      this.playerCollider.radius = 0.35;
      this.camera.position.copy(this.playerCollider.end);
      this.camera.rotation.set(0, 0, 0);
    }
  }

  private animate(): void {
    const deltaTime =
      Math.min(0.05, this.clock.getDelta()) / this.STEPS_PER_FRAME;
    for (let i = 0; i < this.STEPS_PER_FRAME; i++) {
      this.controls(deltaTime);
      this.updatePlayer(deltaTime);
      this.updateSpheres(deltaTime);
      this.updateMonsters();
      this.teleportPlayerIfOob();
    }
    if (this.spawnTime <= 0) {
      this.spawnTime = this.timer;
      this.spawnMonster();
    }
    this.spawnTime -= deltaTime;
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }
  public Render() {}
  public Destroy() {}
}

export default Web;
