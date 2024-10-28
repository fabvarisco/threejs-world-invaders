import {
  Vector3,
  Group,
  Mesh,
  Object3D,
  Scene,
  ColorRepresentation,
} from "three";
import GameObject from "./GameObject";
import { ExplosionParticles } from "../../utils/utils";

class InvaderGameObject extends GameObject {
  protected args: any;
  protected target: Vector3 | null = null;
  protected color: ColorRepresentation = 0xffffff;
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number,
    scene: Scene,
    args?: any
  ) {
    super(model, position, speed, scene);
    this.args = args;
    this.color = this.args.color;
    this.Init();
  }

  public Init() {
    console.log("asas")
    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        child.material.color.set(this.color);
        console.log("Invader") 
      }
    });

    this.CreateCollider(0.6);
    this.CreateColliderHelper();
  }

  public Update(_deltaTime: number): void {
    if (!this.target) return;
    this.MoveTo(this.target, _deltaTime);
    this.LookTo(this.target);
    if (this.collider) {
      const deltaPosition = this.velocity.clone().multiplyScalar(_deltaTime);
      this.collider.center.add(deltaPosition);

      if (this.colliderHelper) {
        this.colliderHelper.position.copy(this.collider.center);
      }
    }
  }

  public Destroy(): void {
    super.Destroy();
    ExplosionParticles(this.model.position, this.scene, this.color);
  }

  public DetectCollisionWithCityObjects(cityObjects: Mesh[]): any[] {
    const collidedObjects = [];

    for (const cityObject of cityObjects) {
      if (this.GetBox().intersectsBox(cityObject.geometry.boundingBox!)) {
        collidedObjects.push(cityObject);
      }
    }

    return collidedObjects;
  }

  public SetTarget(_target: Vector3): void {
    this.target = _target;
  }
}

export default InvaderGameObject;
