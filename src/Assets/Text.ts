import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader.js";
import {
  TextGeometry,
  TextGeometryParameters,
} from "three/examples/jsm/geometries/TextGeometry.js";
import { Mesh, MeshPhongMaterial, Scene } from "three";

class Text {
  private readonly text: string;
  private readonly font: string;
  private scene: Scene;
  private loader: FontLoader;
  private textMesh: Mesh;
  private readonly textGeometryParameters?: Omit<
    TextGeometryParameters,
    "font"
  >;
  constructor(
    font: string,
    text: string,
    scene: Scene,
    textGeometryParameters?: Omit<TextGeometryParameters, "font">,
  ) {
    this.font = font;
    this.text = text;
    this.scene = scene;
    this.loader = new FontLoader();
    this.textMesh = new Mesh();
    this.textGeometryParameters = textGeometryParameters;
    if (!this.textGeometryParameters) {
      this.textGeometryParameters = {
        size: 0.8,
        height: 1,
        curveSegments: 10,
        bevelEnabled: false,
        bevelOffset: 0,
        bevelSegments: 1,
        bevelSize: 0.3,
        bevelThickness: 1,
      };
    }

    this._loadFont();
  }
  private _loadFont() {
    this.loader.load(this.font, this._createFont.bind(this));
  }

  private _createFont(font: Font) {
    const geometry = new TextGeometry(this.text, {
      font: font,
      ...this.textGeometryParameters,
    });
    const materials = [
      new MeshPhongMaterial({ color: 0xff6600 }),
      new MeshPhongMaterial({ color: 0x0000ff }),
    ];
    this.textMesh = new Mesh(geometry, materials);
    this.textMesh.position.y = 5;
    this.textMesh.position.x = -7;
    this.textMesh.rotation.y = 0;
    this.textMesh.updateMatrixWorld();
    this.scene.add(this.textMesh);
  }
}

export default Text;
