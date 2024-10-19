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

    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        child.material.color.set(this.color);
        console.log(this.color);
      }
    });
  }

  // public Update(_target: Vector3, _deltaTime: number) {
  //   this.MoveTo(_target, _deltaTime);
  //   this.LookTo(_target);
  // }
  public Update(_deltaTime: number) {
    // this.MoveTo(_target, _deltaTime);
    // this.LookTo(_target);
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
}

export default InvaderGameObject;
