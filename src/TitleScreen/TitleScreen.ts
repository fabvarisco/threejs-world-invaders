import Text from "@/Assets/Text.ts";
import {
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { instanceNewSceneObject } from "@/utils/utils.ts";
import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";

class TitleScreen {
  private titleText: Text;
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  constructor(camera: PerspectiveCamera, renderer: WebGLRenderer) {
    this.scene = new Scene();
    this.camera = camera;
    this.renderer = renderer;

    this.scene.add(new HemisphereLight(0x606060, 0x404040));

    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    this.titleText = new Text(
      "./fonts/Pixel.json",
      "World Invaders",
      this.scene,
      new Vector3(-4, 3, 10),
    );
    this.titleText.GetTextMesh().position.set(-20, 0, 0);
    this.titleText.GetTextMesh().updateMatrixWorld();
    console.log(this.titleText.GetTextMesh());
    console.log(this.titleText);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.autoRotate = false;

    instanceNewSceneObject("Earth", SceneObject, this.scene, {});
  }

  //@ts-ignore
  Render(timestamp: any, frame: any) {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  Destroy() {
    this.titleText.Destroy();
    this.controls.dispose();
  }
}

export default TitleScreen;
