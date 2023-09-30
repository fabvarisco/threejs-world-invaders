import SceneObject from "@/Assets/SceneObject.ts";
import { ISceneObjects } from "@/type";

class PortalWeb extends SceneObject {
  private readonly hp: number;
  constructor({ object, position, scene }: ISceneObjects) {
    super({ object: object, position: position, scene: scene });
    this.scene = scene;
    this.hp = 10;
    console.log(scene);
  }

  Render() {
    super.Render();
    if (this.hp <= 0) {
      this.scene.remove(this.object);
    }
  }
}

export default PortalWeb;
