import { ISceneObjects } from "@/type";
import Monster from "@/Assets/SceneObjects/Monster.ts";

class Bee extends Monster {
  constructor({ object, position, scene }: ISceneObjects) {
    super({ object: object, position: position, scene: scene });
  }

  Render() {
    super.Render();
  }
}
export default Bee;
