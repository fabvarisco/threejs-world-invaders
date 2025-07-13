import * as THREE from "three";
import GameObject from "../assets/gameObjects/GameObject";
import { CreateStars, GLOBAL_ASSETS, SpawnInvaders } from "../utils/utils";
import WorldWebGameObject from "../assets/gameObjects/WorldWebGameObject";
import Player from "../assets/WebPlayer";
import InvaderGameObject from "../assets/gameObjects/InvaderGameObject";
import Stats from "three/examples/jsm/libs/stats.module.js";
import ShootGameObject from "../assets/gameObjects/ShootGameObject";

class Web {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly fillLight1: THREE.HemisphereLight;
  private readonly directionalLight: THREE.DirectionalLight;
  private readonly invaderShoots: GameObject[] = [];
  private clock: THREE.Clock;
  private renderer: THREE.WebGLRenderer;
  private worldWeb: WorldWebGameObject;
  private spawnTime: number = 10;
  private timer: number = 10;
  private player: Player;
  private stats: Stats;
  private gameObjectList: GameObject[] = [];
  private invaders: InvaderGameObject[] = [];
  private projectiles: ShootGameObject[] = [];
  constructor(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
  ) {
    this._createGameEvents();
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

    this.worldWeb = new WorldWebGameObject(
      GLOBAL_ASSETS.assets.get("collisionWorld")!,
      new THREE.Vector3(0, 0, 0),
      0,
      this.scene
    );

    this.scene.add(this.worldWeb.GetModel());

    this.player = new Player(this.scene, this.camera, this.worldWeb);

    CreateStars(this.scene);

    this.stats = new Stats();
    const container = document.getElementById("stats-container");
    container?.appendChild(this.stats.dom);

    this.animate();
  }

  private _createGameEvents() {
    document.addEventListener("addInstance", (event: Event) => {
      const customEvent = event as CustomEvent;
      this._onAddInstance(customEvent.detail as ShootGameObject);
    });
  }

  private _onAddInstance(_instance: ShootGameObject) {
    this.projectiles.push(_instance);
  }

  private updateInvaders(_deltaTime: number): void {
    this.invaders.forEach((el, index, object) => {
      if (el.IsRemoved()) {
        object.splice(index, 1);
      }
      el.SetTarget(this.player.GetPosition())
      el.Update(_deltaTime);
    });

    this.invadersCollisions();
  }

  private invadersCollisions(): void {
    for (let playerShoot of this.projectiles) {
      if(playerShoot.IsRemoved()) continue;
      for (let invader of this.invaders) {
        if(invader.IsRemoved()) continue;
        if (playerShoot.IntersectsWith(invader)) {
          invader.Destroy();
          playerShoot.Destroy();
        }
      }
    }
  }


  private animate(): void {
    if (this.player.IsEndGame()) {
      document.exitPointerLock();
      return;
    }
    const deltaTime = this.clock.getDelta();
    this.player.Update(deltaTime);

    this.gameObjectList.forEach((gameObject) => {
      gameObject.Update(deltaTime);
    });

    this.updateInvaders(deltaTime);

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const gameObject = this.projectiles[i];
      if (gameObject.IsRemoved()) {
        this.projectiles.splice(i, 1);
      } else {
        gameObject.Update(deltaTime);
      } 
    }


    this.invaderShoots.forEach((el, index, object) => {
      if (el.IsRemoved()) {
        object.splice(index, 1);
      }
      el.Update(deltaTime);
      el.AddScalar(deltaTime);
    });


    this.player.PlayerCollisionsWithOthers(this.invaderShoots);
    this.player.PlayerCollisionsWithOthers(this.invaders);

    if (this.spawnTime <= 0) {
      this.spawnTime = this.timer;
      SpawnInvaders(
        this.scene,
        this.invaders,
        this.invaderShoots,
        [this.worldWeb.GetRandomMesh(), this.worldWeb.GetRandomMesh()]
      );
    }
    this.spawnTime -= deltaTime;

    this.stats.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  Destroy() {
    this.renderer.setAnimationLoop(null);
  }
}

export default Web;
