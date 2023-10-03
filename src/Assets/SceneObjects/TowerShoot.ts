import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { Vector3 } from "three";
import { ISceneObjects } from "@/type";
import { removeSceneObject } from "@/utils/utils.ts";

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
    //     this.scene.remove(this.object);
    //     removeSceneObject(item);
    //     removeSceneObject(this);
    //     this.target = undefined;
    //   }
    // }
    //
    // for (const item of this.collisionWith) {
    //   if (item.GetObjectBox().intersectsBox(this.GetObjectBox())) {
    //     console.log("collision");
    //     this.scene.remove(item.GetObject());
    //     this.scene.remove(this.object);
    //     removeSceneObject(item);
    //     removeSceneObject(this);
    //     this.target = undefined;
    //   }
    // }

    if (!this.target) return;
    this.object.position.add(this.direction);

    const distance = this.target
      ?.GetObject()
      .position.distanceTo(this.object.position);

    if (distance <= 1.0) {
      this.scene.remove(this.target.GetObject());
      this.scene.remove(this.object);
      removeSceneObject(this.target);
      removeSceneObject(this);
      this.target = undefined;
      console.log(this.target);
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
    if (this.target) {
      this.object.position.add(this.direction);
      this.checkCollision();
    }
  }
}

export default TowerShoot;
