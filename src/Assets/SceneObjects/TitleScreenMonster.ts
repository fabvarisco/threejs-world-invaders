import { ISceneObjects } from "@/type";
import {Vector3} from "three";
import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";

class TitleScreenMonster extends  SceneObject{
  private target: any;
  constructor({object, scene, args}:ISceneObjects) {
    super({ object, scene, args })

    this.target = args.target;

  }

  public Render(){
    const speed = 0.01;

    const direction = new Vector3();
    direction.subVectors(this.target.position, this.object.position);
    direction.normalize();

    this.object.position.addScaledVector(direction, speed);

    this.object.position.add(this.direction);

    const distance = this.target.position.distanceTo(this.object.position);
    if (distance <= 1.0) {
      this.Destroy();
    }
  }
}
export default TitleScreenMonster;
