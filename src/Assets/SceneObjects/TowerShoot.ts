import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { Raycaster, Vector3 } from "three";
import { ISceneObjects } from "@/type";
import { SCENE_OBJECTS } from "@/utils/utils.ts";

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
    // for (const item of this.collisionWith) {
    //   const raycaster = new Raycaster(this.object.position, this.direction);
    //   const intersections = raycaster.intersectObject(item.GetObject());
    //   if (intersections.length > 0) {
    //     console.log("collision");
    //     this.scene.remove(item.GetObject());
    //   }
    // }

    for (const item of this.collisionWith) {
      if (item.GetObjectBox().intersectsBox(this.GetObjectBox())) {
        console.log("collision");
        this.scene.remove(item.GetObject());
      }
    }
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
      this.checkCollision();
    }
  }
}

export default TowerShoot;
