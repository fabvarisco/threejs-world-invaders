import {
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  Object3D,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CreateStars } from "../utils";
import Text from "../assets/Text";
import InvaderGameObject from "../assets/gameObjects/InvaderGameObject";
import EarthGameObject from "../assets/gameObjects/EarthGameObject";
class TitleScreen {
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private earth: EarthGameObject;
  private invaderModel: Object3D;
  private invaders: InvaderGameObject[] = [];
  private spawnTime: number = 2000;
  private timer: number = 2000;
  private lastFrameTimestamp: number = 0;
  private titleText: Text;

  constructor(
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
    prefabs: Map<string, Object3D>
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
    this.earth = new EarthGameObject(
      prefabs.get("earth")!,
      new Vector3(0, 0, 0),
      0,
      this.scene
    );
    this.scene.add(this.earth.GetModel());

    this.invaderModel = prefabs.get("invader")!;
    this.invaderModel.scale.set(4, 4, 4);

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
    const invaderModel = this.invaderModel.clone();
    const newInvader = new InvaderGameObject(
      invaderModel,
      position,
      0.01,
      this.scene
    );
    console.log(this.invaders);
    this.invaders.push(newInvader);
    this.scene.add(newInvader.GetModel());
  }

  private updateInvaders(_deltaTime: number) {
    this.invaders.forEach((el, index, object) => {
      el.Update(this.earth.GetModel().position, _deltaTime);
      el.DestroyOnDistance(this.earth.GetModel().position, 8.0);
      if (el.IsRemoved()) {
        object.splice(index, 1);
      }
    });
  }

  private updateEarth(_deltaTime: number) {
    this.earth.Update(_deltaTime);
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
