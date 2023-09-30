import { Group, Scene, Vector3 } from "three";
import { ISceneObjects } from "@/type";

class SceneObject {
  protected object: Group;
  protected position: Vector3 | null;
  protected scene: Scene;
  constructor({ object, position, scene }: ISceneObjects) {
    this.object = object.clone();
    this.position = position || null;
    this.scene = scene;
    if (this.position) {
      this.object.position.x = this.position.x;
      this.object.position.y = this.position.y;
      this.object.position.z = this.position.z;
    }
    this.scene.add(this.object);
  }

  Render() {
    //console.log("render tower")
  }
}

export default SceneObject;
