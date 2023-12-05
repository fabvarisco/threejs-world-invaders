import {
  Vector3,
  Group,
  Mesh,
  Object3D,
  Scene,
  IcosahedronGeometry,
  MeshLambertMaterial,
  ColorRepresentation,
} from "three";
import InvaderGameObject from "./InvaderGameObject";
import GameObject from "./GameObject";

class RedInvaderGameObject extends InvaderGameObject {
  private targetPosition: Vector3 | null = null;
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
    this.color = 0xff0000;
    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        child.material.color.set(this.color);
        console.log(this.color);
      }
    });
  }

  private _shoot(targetPosition: Vector3) {
    const sphereGeometry = new IcosahedronGeometry(0.2, 5);
    const sphereMaterial = new MeshLambertMaterial({ color: this.color });
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

    this.args.shootsArray.push(shoot);
    this.scene.add(shoot.GetModel());
  }

  public Update(_target: Vector3, _deltaTime: number): void {
    if (!this.shooting) {
      if (this.targetPosition === null) {
        this.targetPosition = _target.clone();
      } else {
        this.MoveTo(this.targetPosition, _deltaTime);
        if (this.model.position.distanceTo(this.targetPosition) <= 2) {
          this.shooting = true;
        }
      }
    } else {
      if (this.shootTimer <= 0) {
        this.shootTimer = this.timer;
        this._shoot(_target);
      }
      this.shootTimer -= _deltaTime;
    }
    this.LookTo(_target);
  }
}

export default RedInvaderGameObject;
