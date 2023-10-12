import { Box3, Group, Scene, Vector3 } from "three";
import { ISceneObjects, ISceneObjectsArgs } from "@/type";
import { v4 as uuidv4 } from "uuid";
import { removeSceneObject } from "@/utils/utils.ts";

class SceneObject {
  protected object: Group;
  protected scene: Scene;
  protected direction: Vector3;
  protected collisionBox: Box3;
  protected args: ISceneObjectsArgs;
  protected uid: any;
  constructor({ object, scene, args }: ISceneObjects) {
    this.object = object.clone();
    this.direction = new Vector3(0, 0, 0);
    this.collisionBox = new Box3().setFromObject(this.object);
    this.collisionBox.getSize(new Vector3());
    this.scene = scene;
    this.args = { ...args };
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
    removeSceneObject(this, this.scene);
  }
  collidesWith(otherObject: SceneObject): boolean {
    return this.GetObjectBox().intersectsBox(otherObject.GetObjectBox());
  }
}

export default SceneObject;
