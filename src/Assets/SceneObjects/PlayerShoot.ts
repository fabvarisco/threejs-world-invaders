import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { ISceneObjects } from "@/type";

class PlayerShoot extends SceneObject {
  constructor({ object, scene, args }: ISceneObjects) {
    super({ object, scene, args });

    this.object.quaternion.setFromRotationMatrix(
      this.args.controller!.matrixWorld,
    );
  }
  updatePos() {
    this.object.position.add(this.args.velocity!);
    if (this.object.position.distanceTo(this.args.controller!.position) > 10) {
      this.Destroy();
    }
  }

  Render() {
    super.Render();
    this.updatePos();
  }
}
export default PlayerShoot;
