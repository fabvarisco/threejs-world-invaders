import Text from "@/Assets/Text.ts";
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class TitleScreen {
  private titleText: Text;
  private controls: OrbitControls;
  constructor(
    scene: Scene,
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
  ) {
    this.titleText = new Text(
      "./fonts/Pixel.json",
      "World Invaders",
      scene,
      new Vector3(-4, 3, 10),
    );
    this.titleText.GetTextMesh().position.set(-20, 0, 0);
    this.titleText.GetTextMesh().updateMatrixWorld();
    console.log(this.titleText.GetTextMesh());
    console.log(this.titleText);

    this.controls = new OrbitControls(camera, renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.autoRotate = false;
  }

  //@ts-ignore
  Render(timestamp: any, frame: any) {
    this.controls.update();
  }

  Destroy() {
    this.titleText.Destroy();
    this.controls.dispose();

    this.titleText = null;
    this.controls = null;
  }
}

export default TitleScreen;
