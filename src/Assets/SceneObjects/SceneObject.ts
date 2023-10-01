import { Box3, Group, Scene, Vector3 } from "three";
import { ISceneObjects } from "@/type";

class SceneObject {
  protected object: Group;
  protected position: Vector3 | null;
  protected scene: Scene;
  protected direction: Vector3;
  protected collisionBox: Box3;
  protected collisionWith: SceneObject[];
  constructor({ object, position, scene }: ISceneObjects) {
    this.object = object.clone();
    this.position = position || null;
    this.direction = new Vector3(0, 0, 0);
    this.collisionBox = new Box3().setFromObject(this.object);
    this.collisionWith = [];
    this.scene = scene;
    if (this.position) {
      this.object.position.x = this.position.x;
      this.object.position.y = this.position.y;
      this.object.position.z = this.position.z;
    }

    this.scene.add(this.object);
  }

  Render() {}

  GetObject() {
    return this.object;
  }

  GetObjectBox() {
    return this.collisionBox;
  }

  Destroy() {
    this.scene.remove(this.object);
  }
}

export default SceneObject;
