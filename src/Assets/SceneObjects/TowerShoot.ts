import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { Raycaster, Vector3 } from "three";
import { ISceneObjects } from "@/type";

class TowerShoot extends SceneObject {
  private target: SceneObject | undefined;
  constructor({
    object: object,
    position: position,
    scene: scene,
  }: ISceneObjects) {
    super({ object: object, position: position, scene: scene });
  }

  checkCollision() {
    for (const item of this.collisionWith) {
      const raycaster = new Raycaster(this.object.position, this.direction);
      const intersections = raycaster.intersectObject(item.GetObject());

      if (intersections.length > 0) {
        debugger;
      }

      return intersections.length > 0;
    }

    return false;
  }

  SetTarget(target: SceneObject) {
    if (this.target) return;
    this.target = target;
    this.collisionWith.push(this.target);
    this.direction = new Vector3();
    this.direction.subVectors(
      this.target.GetObject().position,
      this.object.position,
    );
    this.direction.normalize().multiplyScalar(1);
  }

  Render() {
    if (this.target && this.direction) {
      this.object.position.add(this.direction);
      if (this.checkCollision()) {
        debugger;
        this.scene.remove(this.object);
        console.log("collision");
      }
    }
  }
}

export default TowerShoot;
