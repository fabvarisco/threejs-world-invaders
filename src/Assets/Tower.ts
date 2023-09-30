import SceneObject from "@/Assets/SceneObject.ts";
import { ISceneObjects } from "@/type";
import { instanceNewSceneObject } from "@/utils/utils.ts";
import Monster from "@/Assets/Monster.ts";
class Tower extends SceneObject {
  private spawnTimer: number;
  constructor({ object, position, scene }: ISceneObjects) {
    super({ object: object, position: position, scene: scene });
    this.scene = scene;
    console.log(scene);
    this.spawnTimer = 1000;
  }

  Render() {
    super.Render();
    console.log(this.spawnTimer);
    this.spawnTimer -= 1;
    if (this.spawnTimer <= 0) {
      instanceNewSceneObject(
        "Monster",
        this.object?.position,
        Monster,
        this.scene,
      );
      this.spawnTimer = 1000;
      console.log("spawn");
    }
  }
}

export default Tower;
