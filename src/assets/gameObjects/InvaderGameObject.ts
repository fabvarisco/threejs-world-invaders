import {
  Vector3,
  Group,
  Mesh,
  Object3D,
  Scene,
  ColorRepresentation,
} from "three";
import GameObject from "./GameObject";
import { ExplosionParticles } from "../../utils";

class InvaderGameObject extends GameObject {
  protected color: ColorRepresentation;
  protected args: ColorRepresentation;
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number,
    scene: Scene,
    args?: any
  ) {
    super(model, position, speed, scene);
    this.color = 0xffffff;
    this.args = args;
    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        child.material.color.set(this.color);
      }
    });
  }

  public Update(_target: Vector3, _deltaTime: number) {
    this.MoveTo(_target, _deltaTime);
    this.LookTo(_target);
  }

  public Destroy(): void {
    super.Destroy();
    ExplosionParticles(this.model.position, this.scene, this.color);
  }

  public DetectCollisionWithCityObjects(cityObjects: Mesh[]) {
    const collidedObjects = [];

    for (const cityObject of cityObjects) {
      if (this.GetBox().intersectsBox(cityObject.geometry.boundingBox!)) {
        collidedObjects.push(cityObject);
      }
    }

    return collidedObjects;
  }
}

export default InvaderGameObject;
