import { Vector3, Group, Mesh, Object3D, Scene } from "three";
import GameObject from "./GameObject";

class EarthGameObject extends GameObject {
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number,
    scene: Scene
  ) {
    super(model, position, speed, scene);
    this.model.scale.set(0.01, 0.01, 0.01);
  }


  public Update(_deltaTime: number): void {
    this.model.rotation.y += 0.0001 * _deltaTime;
  }
}

export default EarthGameObject;
