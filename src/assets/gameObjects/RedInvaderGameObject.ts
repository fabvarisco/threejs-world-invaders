import {
  Vector3,
  Group,
  Mesh,
  Object3D,
  Scene,
  IcosahedronGeometry,
  MeshLambertMaterial,
} from "three";
import InvaderGameObject from "./InvaderGameObject";
import GameObject from "./GameObject";

class RedInvaderGameObject extends InvaderGameObject {
  private shooting = false;
  private shootTimer: number = 3;
  private timer: number = 3;
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number,
    scene: Scene,
    args?: any
  ) {
    super(model, position, speed, scene, args);
  }

  private _shoot(targetPosition: Vector3) {
    const sphereGeometry = new IcosahedronGeometry(0.2, 5);
    const sphereMaterial = new MeshLambertMaterial({ color: this.color ?? 0xffffff });
    const meshSphere = new Mesh(sphereGeometry, sphereMaterial);
    meshSphere.castShadow = true;
    meshSphere.receiveShadow = true;

    const shoot = new GameObject(
      meshSphere,
      this.model.position,
      0.1,
      this.scene
    );

    const direction = targetPosition
      .clone()
      .sub(this.model.position)
      .normalize();

    shoot.SetVelocity(direction.multiplyScalar(5));
    shoot.CreateBox();
    this.args.shootsArray.push(shoot);
    this.scene.add(shoot.GetModel());
  }

  public Update(_deltaTime: number): void {
    if (!this.target) return;
    if (!this.shooting) {
      this.MoveTo(this.target, _deltaTime);
      if (this.model.position.distanceTo(this.target) <= 2) {
        this.shooting = true;
      }
    } else {
      if (this.shootTimer <= 0) {
        this.shootTimer = this.timer;
        this._shoot(this.target);
      }
      this.shootTimer -= _deltaTime;
    }
    this.LookTo(this.target);
    this.box3?.setFromObject(this.model);
    this.box3Helper?.updateMatrix();
  }
}

export default RedInvaderGameObject;
