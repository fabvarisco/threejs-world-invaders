import * as THREE from "three";
import { Capsule } from "three/addons/math/Capsule.js";
import GameObject from "../assets/gameObjects/GameObject";
import { CreateStars, SpawnInvaders } from "../utils";
import WorldWebGameObject from "../assets/gameObjects/WorldWebGameObject";
import Player from "../assets/Player";
import InvaderGameObject from "../assets/gameObjects/InvaderGameObject";
import GreenInvaderGameObject from "../assets/gameObjects/GreenInvaderGameObject";

class Web {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly fillLight1: THREE.HemisphereLight;
  private readonly directionalLight: THREE.DirectionalLight;
  private readonly GRAVITY: number;
  private readonly playerShoots: GameObject[] = [];
  private readonly invaderShoots: GameObject[] = [];
  private readonly playerCollider: Capsule;
  private readonly playerVelocity: THREE.Vector3;
  private readonly playerDirection: THREE.Vector3;
  private readonly keyStates: { [key: string]: boolean };
  private readonly assets:  Map<string, THREE.Object3D>
  private clock: THREE.Clock;
  private renderer: THREE.WebGLRenderer;
  private playerOnFloor: boolean;
  private mouseTime: number;
  private invaderModel: THREE.Object3D;
  private worldWeb: WorldWebGameObject;
  private invaders: InvaderGameObject[] = [];
  private spawnTime: number = 10;
  private timer: number = 10;
  private shakeIntensity: number = 0;
  private player: Player = new Player();
  private gunModel: THREE.Object3D;
  constructor(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    assets: Map<string, THREE.Object3D>
  ) {
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
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
    this.assets = assets;
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
      if (this.player.IsEndGame()) return;
      document.body.requestPointerLock();
      this.mouseTime = performance.now();
    });
    document.addEventListener("mouseup", () => {
      if (document.pointerLockElement !== null) this.throwBall();
    });
    document.body.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement === document.body) {
        this.camera.rotation.y -= event.movementX / 1200;
        this.camera.rotation.x -= event.movementY / 1200;
      }
    });
    window.addEventListener("resize", this.onWindowResize);
    this.onWindowResize();

    this.invaderModel = this.assets.get("invader")!;
    this.invaderModel.scale.set(1, 1, 1);
    this.worldWeb = new WorldWebGameObject(
      this.assets.get("city")!,
      new THREE.Vector3(0, 0, 0),
      0,
      this.scene
    );

    this.scene.add(this.worldWeb.GetModel());

    CreateStars(this.scene);

    const crosshair = document.createElement("div");
    crosshair.id = "crosshair";
    document.body.appendChild(crosshair);

    const gun = this.assets.get("gun")!.clone();
    gun.position.set(0, -0.15, -0.5);
    gun.rotation.set(Math.PI, 0, Math.PI);
    this.gunModel = new THREE.Object3D();
    this.camera.add(this.gunModel);
    this.gunModel.add(gun);
    this.scene.add(this.gunModel);
    this.animate();
  }


  private updateInvaders(_deltaTime: number): void {
    this.invaders.forEach((el, index, object) => {
      if (el.IsRemoved()) {
        object.splice(index, 1);
      }
      el.Update(this.camera.position, _deltaTime);
    });

    this.invadersCollisions();
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private throwBall(): void {
    const playerShootGeometry = new THREE.IcosahedronGeometry(0.1, 5);
    const playerShootMaterial = new THREE.MeshLambertMaterial({
      color: 0xdede8d,
    });
    const playerShootMesh = new THREE.Mesh(
      playerShootGeometry,
      playerShootMaterial
    );
    playerShootMesh.castShadow = true;
    playerShootMesh.receiveShadow = true;

    const playerShoot = new GameObject(
      playerShootMesh,
      this.gunModel.localToWorld(new THREE.Vector3(0.15, -0.15, -0.5)),
      30,
      this.scene
    );

    const impulse =
      15 + 30 * (1 - Math.exp((this.mouseTime - performance.now()) * 0.001));
    playerShoot.SetVelocity(
      this.gunModel
        .localToWorld(new THREE.Vector3(0, 0, -1))
        .sub(this.camera.position)
        .normalize()
        .multiplyScalar(impulse * 4)
    );

    this.playerShoots.push(playerShoot);
    this.scene.add(playerShoot.GetModel());
  }

  private playerCollisions(): void {
    const result = this.worldWeb.GetOctree().capsuleIntersect(this.playerCollider);
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

    for (let i = 0; i < this.invaders.length; i++) {
      const invader = this.invaders[i];
      if (invader.GetModel().position.distanceTo(this.camera.position) <= 1) {
        this.player.TakeDamage();
        invader.Destroy();
        this.shakeIntensity = 1;
      }
    }

    for (let i = 0; i < this.invaderShoots.length; i++) {
      const shoot = this.invaderShoots[i];
      if (shoot.GetModel().position.distanceTo(this.camera.position) <= 0.5) {
        shoot.Destroy();
        this.player.TakeDamage();
        this.shakeIntensity = 1;
      }
    }
  }

  private updateCamera(_deltaTime: number): void {
    if (this.shakeIntensity > 0) {
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity;

      this.camera.position.x += offsetX;
      this.camera.position.y += offsetY;

      this.shakeIntensity -= _deltaTime;
    }
  }

  private invaderWorldCollisions(): void {
    console.log(this.invaders.filter(invader => invader.constructor == GreenInvaderGameObject))
    this.invaders.filter(invader => invader.constructor == GreenInvaderGameObject).forEach((invader) => {
      this.worldWeb.GetMeshes().forEach((el, index, object) => {
        const elBox = new THREE.Box3().setFromObject(el);
        const result = elBox.intersectsBox(invader.GetBox());
        if (result) {
          invader.Destroy();
          this.worldWeb.GetModel().remove(el);
          this.worldWeb.ResetOctree();
          object.splice(index, 1);
        }
      });
    });
  }

  private invadersCollisions(): void {
    for (let i = 0; i < this.playerShoots.length; i++) {
      for (let j = 0; j < this.invaders.length; j++) {
        const playerShoot = this.playerShoots[i];
        const invader = this.invaders[j];

        if (invader.IntersectBoxWith(playerShoot)) {
          playerShoot.Destroy();
          this.playerShoots.splice(i, 1);

          invader.Destroy();
          this.invaders.splice(j, 1);

          i--;
          j--;
        }
      }
    }

    for (let i = 0; i < this.playerShoots.length; i++) {
      for (let j = 0; j < this.invaders.length; j++) {
        const playerShoot = this.playerShoots[i];
        const invader = this.invaders[j];

        if (invader.IntersectBoxWith(playerShoot)) {
          playerShoot.Destroy();
          this.playerShoots.splice(i, 1);

          invader.Destroy();
          this.invaders.splice(j, 1);

          i--;
          j--;
        }
      }
    }
  }

  private updatePlayer(_deltaTime: number): void {
    let damping = Math.exp(-4 * _deltaTime) - 1;
    if (!this.playerOnFloor) {
      this.playerVelocity.y -= this.GRAVITY * _deltaTime;
      damping *= 0.1;
    }
    this.playerVelocity.addScaledVector(this.playerVelocity, damping);
    const deltaPosition = this.playerVelocity
      .clone()
      .multiplyScalar(_deltaTime);
    this.playerCollider.translate(deltaPosition);
    this.playerCollisions();
    this.camera.position.copy(this.playerCollider.end);
    this.player.Update();
  }

  private updateShoots(_deltaTime: number): void {
    this.playerShoots.forEach((el, index, object) => {
      if (el.IsRemoved()) {
        object.splice(index, 1);
      }
      el.AddScalar(_deltaTime);
    });

    this.invaderShoots.forEach((el, index, object) => {
      if (el.IsRemoved()) {
        object.splice(index, 1);
      }
      el.AddScalar(_deltaTime);
    });
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

  private controls(_deltaTime: number): void {
    const speedDelta = _deltaTime * (this.playerOnFloor ? 25 : 8);
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
      this.player.TakeDamage()
    }
  }

  private animate(): void {
    if (this.player.IsEndGame()) {
      document.exitPointerLock();
      return;
    }
    const deltaTime = this.clock.getDelta();
    this.controls(deltaTime);
    this.updatePlayer(deltaTime);
    this.updateShoots(deltaTime);
    this.updateInvaders(deltaTime);
    this.updateCamera(deltaTime);
    this.teleportPlayerIfOob();
    this.invaderWorldCollisions();

    if (this.spawnTime <= 0) {
      this.spawnTime = this.timer;
      SpawnInvaders(this.scene, this.invaders, this.assets, this.invaderShoots, this.worldWeb.GetRandomMesh());
    }
    this.spawnTime -= deltaTime;
    this.gunModel.position.copy(this.camera.position);
    this.gunModel.rotation.copy(this.camera.rotation);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  Destroy() {
    this.renderer.setAnimationLoop(null);
  }
}

export default Web;
