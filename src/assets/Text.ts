import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader.js";
import {
  TextGeometry,
  TextGeometryParameters,
} from "three/examples/jsm/geometries/TextGeometry.js";
import { Mesh, MeshPhongMaterial, Scene, Vector3 } from "three";

class Text {
  private readonly text: string;
  private readonly font: string;
  private scene: Scene;
  private loader: FontLoader;
  private textMesh: Mesh;
  private readonly position: Vector3 | undefined;
  private readonly textGeometryParameters?: Omit<
    TextGeometryParameters,
    "font"
  >;
  constructor(
    font: string,
    text: string,
    scene: Scene,
    position?: Vector3,
    textGeometryParameters?: Omit<TextGeometryParameters, "font">,
  ) {
    this.font = font;
    this.text = text;
    this.scene = scene;
    this.loader = new FontLoader();
    this.textMesh = new Mesh();
    this.position = position;
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
      new MeshPhongMaterial({ color: 0xffffff }),
      new MeshPhongMaterial({ color: 0x000000 }),
    ];
    this.textMesh = new Mesh(geometry, materials);
    this.textMesh.geometry.center();
    if (this.position) {
      this.textMesh.position.set(
        this.position.x,
        this.position.y,
        this.position.z,
      );
    }

    this.scene.add(this.textMesh);
  }
  public GetTextMesh() {
    return this.textMesh;
  }
  Destroy() {
    this.scene.remove(this.textMesh);
  }
}

export default Text;
