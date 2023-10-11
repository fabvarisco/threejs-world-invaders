import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { ISceneObjects } from "@/type";
import { Vector3 } from "three";
import {
  DEVICE_POSITION,
  getRandom,
  SCENE_OBJECTS,
  STATES,
} from "@/utils/utils.ts";
import PlayerShoot from "@/Assets/SceneObjects/PlayerShoot.ts";

class Monster extends SceneObject {
  private life: number;
  protected initialState: STATES = STATES.CHASING;
  protected state: STATES = STATES.CHASING;
  constructor({ object, scene, args }: ISceneObjects) {
    super({ object, scene, args });
    this.object.position.set(
      this.args.position!.x,
      this.args.position!.y,
      this.args.position!.z,
    );

    this.life = getRandom(1, 3);
  }

  chaseState() {
    const speed = 0.01;

    const direction = new Vector3();
    direction.subVectors(DEVICE_POSITION, this.object.position);
    direction.normalize();

    this.object.position.addScaledVector(direction, speed);

    this.object.position.add(this.direction);

    const distance = DEVICE_POSITION.distanceTo(this.object.position);
    if (distance <= 1.0) {
      this.Destroy();
      console.log(DEVICE_POSITION);
      console.log(this.object.position);
    }
  }
  hitState() {}
  damageState() {}
  dieState() {}
  attackState() {}

  update() {
    switch (this.state) {
      case STATES.CHASING:
        this.chaseState();
        break;
      case STATES.HIT:
        this.hitState();
        break;
      case STATES.ATTACKING:
        this.attackState();
        break;
      case STATES.DIE:
        this.dieState();
        break;
      default:
        break;
    }
  }

  collision() {
    SCENE_OBJECTS.filter((obj) => obj instanceof PlayerShoot).forEach(
      (playerShoot) => {
        const distance = playerShoot
          .GetObject()
          .position.distanceTo(this.object.position);
        if (distance <= 0.5) {
          this.life -= 1;
          playerShoot.Destroy();
        }
      },
    );
    if (this.life <= 0) {
      this.Destroy();
    }
  }
  Render() {
    this.update();
    this.collision();
  }
}
export default Monster;
