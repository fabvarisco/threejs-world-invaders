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
    this.initShootTimer = 150;
    this.shootTimer = this.initShootTimer;
    this.target = null;
  }

  private getTarget() {
    const monster = SCENE_OBJECTS.find((el) => el.constructor === Monster);
    if (monster) {
      console.log("monster", monster);
      const distance = monster
        ?.GetObject()
        .position.distanceTo(this.object.position);
      if (distance <= 100) {
        this.target = monster;
        console.log("target", this.target);
      }
    }
  }

  Render() {
    if (!this.target) {
      this.getTarget();
    } else {
      this.shootTimer -= 1;
      if (this.shootTimer <= 0 && this.target) {
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
