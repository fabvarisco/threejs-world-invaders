import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { ISceneObjects } from "@/type";
import { instanceNewTowerShoot, SCENE_OBJECTS } from "@/utils/utils.ts";
import Monster from "@/Assets/SceneObjects/Monster.ts";

class Tower extends SceneObject {
  private shootTimer: number;
  private readonly initShootTimer: number;
  private target: SceneObject | null;

  constructor({ object, position, scene }: ISceneObjects) {
    super({ object: object, position: position, scene: scene });
    this.initShootTimer = 100;
    this.shootTimer = this.initShootTimer;
    this.target = null;
  }

  private getTarget() {
    const list = SCENE_OBJECTS.filter((el) => el.constructor === Monster);
    list.map((monster) => {
      const distance = monster
        ?.GetObject()
        .position.distanceTo(this.object.position);
      if (distance <= 100) {
        this.target = monster;
      }
    });
  }

  Render() {
    this.getTarget();
    if (this.target) {
      this.shootTimer -= 1;
      if (this.shootTimer <= 0) {
        instanceNewTowerShoot(
          "TowerShoot",
          this.object?.position,
          this.scene,
          this.target,
        );
        this.shootTimer = this.initShootTimer;
        this.target = null;
      }
    }
  }
}

export default Tower;
