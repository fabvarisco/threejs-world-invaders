import { Camera, Group, Mesh, Object3D, Scene, Vector2 } from "three";
import { GameOverOverlay, GLOBAL_ASSETS } from "../utils/utils";
import { CameraType } from "../type";

class Gun {
  private _model: Group | Mesh | Object3D;
  private _scene: Scene;
  constructor(scene: Scene) {
    this._scene = scene;
    console.log(GLOBAL_ASSETS.assets);
    this._model = GLOBAL_ASSETS.assets.get("gun").clone();
    this._createCrosshair();
    this._createGun();
  }

  public Shoot() {}

  public UpdatePosition(_camera: Camera): void {
    this._model.position.copy(_camera.position);
    this._model.rotation.copy(_camera.rotation);
  }

  private _createCrosshair(): void {
    const crosshair = document.createElement("div");
    crosshair.id = "crosshair";
    document.body.appendChild(crosshair);
  }

  private _createGun(): void {
    debugger;
    this._model.position.set(0, -0.15, -0.5);
    this._model.rotation.set(Math.PI, 0, Math.PI);
    this._scene.add(this._model);
  }
}

export default Gun;
