import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { Box3, Vector3 } from "three";
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
    console.log("TowerShoot target", this.target);
  }

  checkCollision() {
    if (!this.target) return;
    this.object.position.add(this.direction);

    const shootBoundingBox = new Box3().setFromObject(this.object);
    const monsterBoundingBox = new Box3().setFromObject(
      this.target.GetObject(),
    );

    if (shootBoundingBox.intersectsBox(monsterBoundingBox)) {
      this.scene.remove(this.target.GetObject());
      this.scene.remove(this.object);
      removeSceneObject(this.target);
      removeSceneObject(this);
      this.target = undefined;
      console.log(this.target);
    }
  }

  SetTarget(target: SceneObject) {
    console.log("settarget", target);
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
