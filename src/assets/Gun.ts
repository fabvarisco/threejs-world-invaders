import { Camera, Group, Mesh, Object3D, Scene, Vector2, Vector3 } from "three";
import { GameOverOverlay, GLOBAL_ASSETS } from "../utils/utils";
import { CameraType } from "../type";
import ShootGameObject from "./gameObjects/ShootGameObject";

class Gun {
  private _model: Group | Mesh | Object3D;
  private _scene: Scene;
  private _camera: Camera;

  constructor(scene: Scene, camera: Camera) {
    this._scene = scene;
    this._camera = camera;
    this._model = new Object3D();
    this._createCrosshair();
    this._createGun();
  }

  public Shoot(_mouseTime: number): void {
    const playerShoot = new ShootGameObject(
      new Group(),
      this._model.localToWorld(new Vector3(0.15, -0.15, -0.5)),
      30,
      this._scene
    );
    playerShoot.SetPosition(
      this._model.localToWorld(new Vector3(0.15, -0.15, -0.5))
    );
    const impulse =
      15 + 30 * (1 - Math.exp((_mouseTime - performance.now()) * 0.001));
    playerShoot.SetVelocity(
      this._model
        .localToWorld(new Vector3(0, 0, -1))
        .sub(this._camera.position)
        .normalize()
        .multiplyScalar(impulse * 4)
    );

    const event = new CustomEvent("addInstance", {
      detail: playerShoot,
    });
    document.dispatchEvent(event);
    this._scene.add(playerShoot.GetModel());
  }

  public UpdatePosition(): void {
    this._model.position.copy(this._camera.position);
    this._model.rotation.copy(this._camera.rotation);
  }

  private _createCrosshair(): void {
    const crosshair = document.createElement("div");
    crosshair.id = "crosshair";
    document.body.appendChild(crosshair);
  }

  private _createGun(): void {
    const gun = GLOBAL_ASSETS.assets.get("gun")!.clone();
    gun.position.set(0, -0.15, -0.5);
    gun.rotation.set(Math.PI, 0, Math.PI);
    this._model.add(gun);
    this._scene.add(this._model);
  }
}

export default Gun;
