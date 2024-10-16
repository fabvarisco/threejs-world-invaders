import { Camera, Group, Mesh, Object3D, Scene } from "three";
import { GameOverOverlay } from "../utils";
import { CameraType } from "../type";

class Gun {
  private _model: Group | Mesh | Object3D;
  private _scene: Scene;
  constructor(
    scene: Scene,
    model: Group | Mesh | Object3D,
  ) {
    this._model = model;
    this._scene = scene;
  }

  public Shoot() {
  }
}

export default Gun;
