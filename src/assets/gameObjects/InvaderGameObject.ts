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
  private _target:Vector3 | null = null;
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
      }
    });
  }

  public Update(_deltaTime: number) : void {
    if (!this._target) return
    this.MoveTo(this._target, _deltaTime);
    this.LookTo(this._target);
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

  public SetTarget(_target:Vector3):void{
    this._target = _target;
  }
}

export default InvaderGameObject;
