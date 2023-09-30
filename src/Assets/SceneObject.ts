import { Group, Scene, Vector3 } from "three";

class SceneObject {
  private object: Group;
  private position: Vector3 | null;
  constructor(object: Group, position?: Vector3, scene: Scene) {
    this.object = object.clone();
    this.position = position || null;

    if (this.position) {
      this.object.position.x = this.position.x;
      this.object.position.y = this.position.y;
      this.object.position.z = this.position.z;
    }
    scene.add(this.object);
  }

  Render() {
    this.object.position.z -= 0.01;
    console.log(this.object.position);
    //console.log("render tower")
  }
}

export default SceneObject;
