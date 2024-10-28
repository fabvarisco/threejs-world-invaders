import {
  Vector3,
  Group,
  Mesh,
  Object3D,
  Scene,
  IcosahedronGeometry,
  MeshLambertMaterial,
  ColorRepresentation,
  Color,
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

  public Init() {
    this.color = 0x732828;
    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        console.log("RED") 
        child.material.color.set(0x732828);
      }
    });

    this.CreateCollider(0.6);
    this.CreateColliderHelper();
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
    if (this.collider) {
      const deltaPosition = this.velocity.clone().multiplyScalar(_deltaTime);
      this.collider.center.add(deltaPosition);

      if (this.colliderHelper) {
        this.colliderHelper.position.copy(this.collider.center);
      }
    }
  }
}

export default RedInvaderGameObject;
