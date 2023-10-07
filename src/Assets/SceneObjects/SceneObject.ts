import { Box3, Box3Helper, Group, Scene, Vector3 } from "three";
import { ISceneObjects, ISceneObjectsArgs } from "@/type";
import { v4 as uuidv4 } from "uuid";
import { removeSceneObject } from "@/utils/utils.ts";

class SceneObject {
  protected object: Group;
  protected scene: Scene;
  protected direction: Vector3;
  protected collisionBox: Box3;
  private boxHelper: Box3Helper;
  protected args: ISceneObjectsArgs;
  protected uid: any;
  constructor({ object, scene, args }: ISceneObjects) {
    this.object = object.clone();
    this.direction = new Vector3(0, 0, 0);
    console.log(this.object);
    this.collisionBox = new Box3().setFromObject(this.object);
    this.collisionBox.getSize(new Vector3());
    this.scene = scene;
    this.args = { ...args };

    this.uid = uuidv4();

    this.boxHelper = new Box3Helper(this.collisionBox, 0xffff00);
    this.scene.add(this.boxHelper);

    this.scene.add(this.object);
  }

  Render() {
    this.boxHelper.position.set(
      this.object.position.x,
      this.object.position.y,
      this.object.position.z,
    );
    console.log("daasd");
  }

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
