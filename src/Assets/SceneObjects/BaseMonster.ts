import { ISceneObjects } from "@/type";
import Monster from "@/Assets/SceneObjects/Monster.ts";

class BaseMonster extends Monster {
  constructor({ object, scene, args }: ISceneObjects) {
    super({ object, scene, args });
  }
}
export default BaseMonster;
