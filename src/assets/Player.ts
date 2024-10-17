import { Camera, Group, Mesh, Object3D, Scene } from "three";
import { GameOverOverlay } from "../utils/utils";
import { CameraType } from "../type";
import Gun from "./Gun";

class Player {
  private life = 3;
  private endGame: boolean = false;
  private _model: Group | Mesh | Object3D;
  private _gun: Gun;
  private _scene: Scene;
  private _camera: Camera;
  private _cameraType: CameraType;
  constructor(scene: Scene, camera: Camera) {
    this._model = new Group();
    this._scene = scene;
    this._camera = camera;
    this._cameraType = "FPS";
    this._gun = new Gun(this._scene);

    this._init();
  }

  private _init() {}

  public TakeDamage() {
    this.life--;
  }

  public Update() {
    if (this.endGame) return;
    if (this.life <= 0) {
      this.endGame = true;
      GameOverOverlay();
    }

    this._gun.UpdatePosition(this._camera);
  }

  public IsEndGame() {
    return this.endGame;
  }

  public ChangeCameraType(_type: CameraType) {
    this._cameraType = _type;
  }
}

export default Player;
