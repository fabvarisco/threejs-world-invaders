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
  protected color: ColorRepresentation | null = null;
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number,
    scene: Scene,
    args?: any
  ) {
    super(model, position, speed, scene);
    this.args = args;
    this.model = model;

    this.Init();
  }

  public Init() {
    this.color = this.args?.color ?? 0xffffff;
    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((mat) => mat.clone());
        } else {
          child.material = child.material.clone();
        }

        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        for (const material of materials) {
          if ("color" in material) {
            material.color.set(this.color);
          }
        }
      }
    });
    this.CreateBox();
  }

  public Update(_deltaTime: number): void {
    if (!this.target) return;
    this.MoveTo(this.target, _deltaTime);
    this.LookTo(this.target);
    this.box3Helper?.updateMatrix();
    this.box3?.setFromObject(this.model);
  }

  public Destroy(): void {
    super.Destroy();
    ExplosionParticles(this.model.position, this.scene, this.color ?? 0xffffff);
  }

  public SetTarget(_target: Vector3): void {
    this.target = _target;
  }
}

export default InvaderGameObject;
