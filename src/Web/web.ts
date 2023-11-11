import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { Octree } from "three/addons/math/Octree.js";
import { OctreeHelper } from "three/addons/helpers/OctreeHelper.js";

import { Capsule } from "three/addons/math/Capsule.js";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";

class Web {
  private clock: THREE.Clock;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private fillLight1: THREE.HemisphereLight;
  private directionalLight: THREE.DirectionalLight;
  private renderer: THREE.WebGLRenderer;
  private GRAVITY: number;
  private SPHERE_RADIUS: number;
  private STEPS_PER_FRAME: number;
  private sphereGeometry: THREE.IcosahedronGeometry;
  private sphereMaterial: THREE.MeshLambertMaterial;
  private spheres: {
    mesh: THREE.Mesh;
    collider: THREE.Sphere;
    velocity: THREE.Vector3;
  }[];
  private sphereIdx: number;
  private worldOctree: Octree;
  private playerCollider: Capsule;
  private playerVelocity: THREE.Vector3;
  private playerDirection: THREE.Vector3;
  private playerOnFloor: boolean;
  private mouseTime: number;
  private keyStates: { [key: string]: boolean };

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
  ) {
    this.clock = new THREE.Clock();
    this.scene = scene;
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
    this.sphereIdx = 0;
    this.worldOctree = new Octree();
    this.playerCollider = new Capsule(
      new THREE.Vector3(0, 0.35, 0),
      new THREE.Vector3(0, 1, 0),
      0.35,
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
    const loader = new GLTFLoader().setPath("./models/");
    loader.load("collision-world.glb", (gltf) => {
      this.scene.add(gltf.scene);
      this.worldOctree.fromGraphNode(gltf.scene);
      gltf.scene.traverse((child) => {
        //@ts-ignore
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          //@ts-ignore
          if (child.material.map) {
            //@ts-ignore
            child.material.map.anisotropy = 4;
          }
        }
      });
      const helper = new OctreeHelper(this.worldOctree);
      helper.visible = false;
      this.scene.add(helper);
      const gui = new GUI({ width: 200 });
      //@ts-ignore
      gui.add({ debug: false }, "debug").onChange((value) => {
        helper.visible = value;
      });
      this.animate();
    });
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private _createSphere() {
    const sphere = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    this.scene.add(sphere);

    this.spheres.push({
      mesh: sphere,
      collider: new THREE.Sphere(
        new THREE.Vector3(0, -100, 0),
        this.SPHERE_RADIUS,
      ),
      velocity: new THREE.Vector3(),
    });
    
  }


  private throwBall(): void {
    this._createSphere();
    const sphere = this.spheres[this.sphereIdx];
    this.camera.getWorldDirection(this.playerDirection);
    sphere.collider.center
      .copy(this.playerCollider.end)
      .addScaledVector(this.playerDirection, this.playerCollider.radius * 1.5);
    const impulse =
      15 + 30 * (1 - Math.exp((this.mouseTime - performance.now()) * 0.001));

    sphere.velocity.copy(this.camera.getWorldDirection(this.playerDirection).clone().multiplyScalar(impulse));
    
    this.sphereIdx = (this.sphereIdx + 1) % this.spheres.length;
  }

  private playerCollisions(): void {
    const result = this.worldOctree.capsuleIntersect(this.playerCollider);
    this.playerOnFloor = false;
    if (result) {
      this.playerOnFloor = result.normal.y > 0;
      if (!this.playerOnFloor) {
        this.playerVelocity.addScaledVector(
          result.normal,
          -result.normal.dot(this.playerVelocity),
        );
      }
      this.playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }
  }


  private spheresCollisions(): void {
    for (let i = 0, length = this.spheres.length; i < length; i++) {
      const s1 = this.spheres[i];
      const result = this.worldOctree.sphereIntersect(s1.collider);
      if(result){
        this.scene.remove(s1.mesh);
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
    this.spheres.forEach((sphere) => {
      sphere.collider.center.addScaledVector(sphere.velocity, deltaTime);
      //const result = this.worldOctree.sphereIntersect(sphere.collider);
      // if (result) {
      //   sphere.velocity.addScaledVector(
      //     result.normal,
      //     -result.normal.dot(sphere.velocity) * 1.5,
      //   );
      //   sphere.collider.center.add(result.normal.multiplyScalar(result.depth));
      // }
      // const damping = Math.exp(-1.5 * deltaTime) - 1;
      // sphere.velocity.addScaledVector(sphere.velocity, damping);
    });
    this.spheresCollisions();
    for (const sphere of this.spheres) {
      sphere.mesh.position.copy(sphere.collider.center);
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
        this.getForwardVector().multiplyScalar(speedDelta),
      );
    }
    if (this.keyStates["KeyS"]) {
      this.playerVelocity.add(
        this.getForwardVector().multiplyScalar(-speedDelta),
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
      this.teleportPlayerIfOob();
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }
  public Render() {}
  public Destroy() {}
}

export default Web;
