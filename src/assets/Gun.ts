import { Camera, Group, Mesh, Object3D, Scene, Vector2 } from "three";
import { GameOverOverlay, GLOBAL_ASSETS } from "../utils/utils";
import { CameraType } from "../type";

class Gun {
  private _model: Group | Mesh | Object3D;
  private _scene: Scene;
  private _camera: Camera;

  constructor(scene: Scene, camera: Camera) {
    this._scene = scene;
    this._camera = camera;

    console.log(GLOBAL_ASSETS.assets);
    this._model = new Object3D();
    this._createCrosshair();
    this._createGun();
  }

  public Shoot(): void {
    const playerShootGeometry = new IcosahedronGeometry(0.1, 5);
    const playerShootMaterial = new MeshLambertMaterial({
      color: 0xdede8d,
    });
    const playerShootMesh = new Mesh(
      playerShootGeometry,
      playerShootMaterial
    );
    playerShootMesh.castShadow = true;
    playerShootMesh.receiveShadow = true;

    // const playerShoot = new GameObject(
    //   playerShootMesh,
    //   this.gunModel.localToWorld(new THREE.Vector3(0.15, -0.15, -0.5)),
    //   30,
    //   this.scene
    // );

    // const impulse =
    //   15 + 30 * (1 - Math.exp((this.mouseTime - performance.now()) * 0.001));
    // playerShoot.SetVelocity(
    //   this.gunModel
    //     .localToWorld(new THREE.Vector3(0, 0, -1))
    //     .sub(this.camera.position)
    //     .normalize()
    //     .multiplyScalar(impulse * 4)
    // );

    // this.playerShoots.push(playerShoot);
    // this.scene.add(playerShoot.GetModel());
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
