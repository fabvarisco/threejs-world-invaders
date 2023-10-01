import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { ISceneObjects } from "@/type";
import { instanceNewSceneObject } from "@/utils/utils.ts";
import Monster from "@/Assets/SceneObjects/Monster.ts";
class SpawnMonsterTower extends SceneObject {
  private spawnTimer: number;
  private readonly initSpawnTimer: number;
  constructor({ object, position, scene }: ISceneObjects) {
    super({ object: object, position: position, scene: scene });
    this.scene = scene;
    this.initSpawnTimer = Math.random() * 5000;
    this.spawnTimer = this.initSpawnTimer;
  }

  Render() {
    super.Render();
    this.spawnTimer -= 1;
    if (this.spawnTimer <= 0) {
      instanceNewSceneObject(
        "Monster",
        this.object?.position,
        Monster,
        this.scene,
      );
      this.spawnTimer = this.initSpawnTimer;
    }
  }
}

export default SpawnMonsterTower;
