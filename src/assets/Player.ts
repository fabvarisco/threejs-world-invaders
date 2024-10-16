import { Camera, Group, Mesh, Object3D, Scene } from "three";
import { GameOverOverlay } from "../utils";
import { CameraType } from "../type";

class Player {
  private life = 3;
  private endGame: boolean = false;
  private _model: Group | Mesh | Object3D;
  private _gun: Group | Mesh | Object3D;
  private _scene: Scene;
  private _camera: Camera;
  private _cameraType: CameraType;
  constructor(
    scene: Scene,
    model: Group | Mesh | Object3D,
    gun: Group | Mesh | Object3D,
    camera: Camera
  ) {
    this._model = model;
    this._gun = gun;
    this._scene = scene;
    this._camera = camera;
    this._cameraType = "FPS";
  }

  public TakeDamage() {
    this.life--;
  }

  public Update() {
    if (this.endGame) return;
    if (this.life <= 0) {
      this.endGame = true;
      GameOverOverlay();
    }
  }

  public IsEndGame() {
    return this.endGame;
  }

  public ChangeCameraType(_type: CameraType) {
    this._cameraType = _type;
  }
}

export default Player;
