import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { ISceneObjects } from "@/type";
import { Sphere, Vector3 } from "three";

class PlayerShoot extends SceneObject {
  private intersections:any = [];
  private collider: Sphere;
  constructor({ object, scene, args }: ISceneObjects) {
    super({ object, scene, args });
    this.intersections = args?.intersections;
    this.collider = new Sphere(
      new Vector3(0, -100, 0),
      0.2,
    );
  }

  updatePos() {
    this.object.position.add(this.args.velocity!);
  }

  collisions(){
    for (let i = 0, length =  this.intersections?.length; i < length; i++) {
      const result = this.intersections[i].sphereIntersect(this.collider);
      if(result){
        this.scene.remove(this.object);
      } 
    }
  }

  Render() {
    super.Render();
    this.updatePos();
  }
}
export default PlayerShoot;
