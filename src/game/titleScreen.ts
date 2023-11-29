import {
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  Group,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Prefab from "../assets/prefabs/Prefab";
import { CreateStars } from "../utils";
import Text from "../assets/Text";
import InvaderGameObject from "../assets/gameObjects/InvaderGameObject";
class TitleScreen {
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private earth: Group;
  private invader: Group;
  private invaders: InvaderGameObject[] = [];
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
    const invaderModel = this.invader.clone();
    const newInvader = new InvaderGameObject(invaderModel, position, 0.01, this.scene);
    console.log(this.invaders);
    this.invaders.push(newInvader);
    this.scene.add(newInvader.GetModel());
  }

  private updateInvaders(deltaTime: number) {
    this.invaders.forEach((el, index, object) => {
      el.Update(this.earth.position, deltaTime);
      el.DestroyOnDistance(this.earth.position, 8.0);
      if (el.isRemoved()) {
        object.splice(index, 1);
      }
    });
  }

  private updateEarth(deltaTime: number) {
    if (!this.earth) return;
    this.earth.rotation.y += 0.0001 * deltaTime;
  }

  private _animate(timestamp: number) {
    const deltaTime = timestamp - this.lastFrameTimestamp;
    this.lastFrameTimestamp = timestamp;

    if (this.spawnTime <= 0) {
      this.spawnTime = this.timer;
      this.spawnInvader();
    }

    this.controls.update();
    this.updateInvaders(deltaTime);
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
