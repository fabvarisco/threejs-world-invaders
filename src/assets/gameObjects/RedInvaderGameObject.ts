import { Vector3, Group, Mesh, Object3D, Scene, IcosahedronGeometry, MeshLambertMaterial } from "three";
import InvaderGameObject from "./InvaderGameObject";
import GameObject from "./GameObject";

class RedInvaderGameObject extends InvaderGameObject {
  private targetPosition: Vector3 | null = null;
  private shooting = false;
  private shootTimer: number = 3;
  private timer: number = 3;
  private shoots: GameObject[] = [];
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number,
    scene: Scene
  ) {
    super(model, position, speed, scene);
    this.color = 0xff0000;
    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        child.material.color.set(this.color);
      }
    });
  }

  private _shoot(targetPosition: Vector3) {
    const sphereGeometry = new IcosahedronGeometry(.2, 5);
    const sphereMaterial = new MeshLambertMaterial({ color: 0xff0000 });
    const meshSphere = new Mesh(sphereGeometry, sphereMaterial);
    meshSphere.castShadow = true;
    meshSphere.receiveShadow = true;

    const sphere = new GameObject(
      meshSphere,
      this.model.position,
      0.1,
      this.scene
    );

    const direction = targetPosition.clone().sub(this.model.position).normalize();

    sphere.SetVelocity(direction.multiplyScalar(5));


    this.shoots.push(sphere);
    this.scene.add(sphere.GetModel());
  }

  public Update(targetPosition: Vector3, deltaTime: number): void {
    if (!this.shooting) {
      if (this.targetPosition === null) {
        this.targetPosition = targetPosition.clone();
      } else {
        this.MoveTo(this.targetPosition, deltaTime);
        if (this.model.position.distanceTo(this.targetPosition) <= 0.8) {
          this.shooting = true;
        }
      }
    }
    this.LookTo(targetPosition);


    this.shoots.forEach((shoot) => {
      shoot.AddScalar(deltaTime);
    })

    if (this.shootTimer <= 0) {
      this.shootTimer = this.timer;
      this._shoot(targetPosition);
    }
    this.shootTimer -= deltaTime;
  }
}

export default RedInvaderGameObject;
