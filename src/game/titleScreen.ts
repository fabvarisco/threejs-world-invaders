import {
  BufferAttribute,
  BufferGeometry,
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
  Group,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Prefab from "../assets/prefabs/Prefab";
import { CreateStars } from "@Utils";
import Text from "@Assets/Text";

class TitleScreen {
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private earth: Group;
  private invader: Group;
  private invaders: Group[] = [];
  private spawnTime: number = 2000;
  private timer: number = 2000;
  private lastFrameTimestamp: number = 0;
  private titleText: Text;

  constructor(
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
    prefabs: Map<string, Prefab>
  ) {
    this.scene = new Scene();
    CreateStars(this.scene);
    this.camera = camera;
    this.renderer = renderer;
    this.scene.add(new HemisphereLight(0x606060, 0x404040));

    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.screenSpacePanning = false;
    this.controls.autoRotate = false;
    this.controls.enableZoom = false;
    this.controls.enabled = false;
    this.controls.minDistance = 40;

    //init prefabs
    this.earth = prefabs.get("earth")!.GetObject()!;
    this.earth.scale.set(0.01, 0.01, 0.01);
    this.invader = prefabs.get("invader")!.GetObject()!;
    this.invader.scale.set(4, 4, 4);
    this.scene.add(this.earth);

    //Text
    this.titleText = new Text(
      "./fonts/Pixel.json",
      "World",
      this.scene,
      new Vector3(0, 4, 30)
    );
    this.titleText = new Text(
      "./fonts/Pixel.json",
      "Invaders",
      this.scene,
      new Vector3(0, 3, 30)
    );
    this.titleText.GetTextMesh().updateMatrixWorld();
    this.renderer.setAnimationLoop(this._animate.bind(this));
  }

  private explosionParticles(position: Vector3) {
    const particleGeometry = new BufferGeometry();
    const particleMaterial = new PointsMaterial({
      color: 0xff0000,
      size: 1,
    });

    const particlesCount = 10;
    const particlesPositions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      particlesPositions[i3] = position.x + (Math.random() - 0.5) * 5;
      particlesPositions[i3 + 1] = position.y + (Math.random() - 0.5) * 5;
      particlesPositions[i3 + 2] = position.z + (Math.random() - 0.5) * 5;
    }

    particleGeometry.setAttribute(
      "position",
      new BufferAttribute(particlesPositions, 3)
    );

    const particles = new Points(particleGeometry, particleMaterial);
    this.scene.add(particles);

    const animateParticles = () => {
      const positions = particleGeometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        positions[i3] += (Math.random() - 0.5) * 3;
        positions[i3 + 1] += (Math.random() - 0.5) * 3;
        positions[i3 + 2] += (Math.random() - 0.5) * 3;
      }

      particleGeometry.attributes.position.needsUpdate = true;

      if (particles.material.opacity > 0) {
        particles.material.opacity -= 0.03;
      } else {
        this.scene.remove(particles);
      }
    };
    const particleAnimation = () => {
      animateParticles();
      requestAnimationFrame(particleAnimation);
    };

    particleAnimation();
  }

  private spawnInvader(): void {
    const minX = -60;
    const maxX = 60;
    const minY = -60;
    const maxY = 60;
    const minZ = -60;
    const maxZ = 60;

    const position: Vector3 = new Vector3(0, 0, 0);
    position.x = Math.random() * (maxX - minX) + minX;
    position.y = Math.random() * (maxY - minY) + minY;
    position.z = Math.random() * (maxZ - minZ) + minZ;
    const newInvader = this.invader.clone();
    newInvader.position.set(position.x, position.y, position.z);

    this.invaders.push(newInvader);
    this.scene.add(newInvader);
  }

  private updateInvaders() {
    if (!this.invader) return;
    this.invaders.forEach((el, index, object) => {
      const speed = 0.05;

      const direction = new Vector3();
      direction.subVectors(this.earth!.position, el.position);
      direction.normalize();
      el.position.addScaledVector(direction, speed);

      el.position.add(new Vector3(0, 0, 0));
      el.lookAt(this.earth?.position);
      const distance = this.earth!.position.distanceTo(el.position);
      if (distance <= 8.0) {
        this.scene.remove(el);
        object.splice(index, 1);
        this.explosionParticles(el.position);
      }
    });
  }

  private updateEarth(deltaTime: number) {
    if (!this.earth) return;
    this.earth.rotation.y += 0.0001 * deltaTime; // Rotate around the y-axis
  }

  private _animate(timestamp: number) {
    const deltaTime = timestamp - this.lastFrameTimestamp;
    this.lastFrameTimestamp = timestamp;

    if (this.spawnTime <= 0) {
      this.spawnTime = this.timer;
      this.spawnInvader();
    }

    this.controls.update();
    this.updateInvaders();
    this.updateEarth(deltaTime);

    this.spawnTime -= deltaTime;

    this.renderer.render(this.scene, this.camera);
  }

  Destroy() {
    this.controls.dispose();
    this.renderer.setAnimationLoop(null);
  }
}

export default TitleScreen;
