import { Box3, Group, Scene, Vector3 } from "three";
import { ISceneObjects } from "@/type";
import { v4 as uuidv4 } from "uuid";

class SceneObject {
  protected object: Group;
  protected position: Vector3 | null;
  protected scene: Scene;
  protected direction: Vector3;
  protected collisionBox: Box3;
  protected collisionWith: SceneObject[];
  protected uid: any;
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

    this.uid = uuidv4();
    this.scene.add(this.object);
  }

  Render() {}

  GetObject() {
    return this.object;
  }

  GetObjectBox() {
    return this.collisionBox;
  }

  GetUID() {
    return this.uid;
  }
  Destroy() {
    this.scene.remove(this.object);
  }
}

export default SceneObject;
