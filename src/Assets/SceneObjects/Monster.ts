import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { ISceneObjects } from "@/type";
import { SCENE_OBJECTS } from "@/utils/utils.ts";
import PortalWeb from "@/Assets/SceneObjects/PortalWeb.ts";
import { Vector3 } from "three";

class Monster extends SceneObject {
  private portal: SceneObject;
  constructor({ object, position, scene }: ISceneObjects) {
    super({ object: object, position: position, scene: scene });
    this.portal = this.getPortal();
    this.direction = new Vector3();
    this.direction.subVectors(
      this.portal?.GetObject().position,
      this.object.position,
    );
    this.direction.normalize().multiplyScalar(0.05);
  }

  private getPortal() {
    return SCENE_OBJECTS.find((item) => item.constructor === PortalWeb);
  }
  private moveToPortal() {
    if (!this.portal) return;
    this.object.position.add(this.direction);

    const distance = this.portal
      ?.GetObject()
      .position.distanceTo(this.object.position);
    if (distance <= 1.0) {
      this.scene.remove(this.object);
    }
  }

  Render() {
    if (!this.portal) {
      this.portal = this.getPortal();
    }
    this.moveToPortal();
  }
}
export default Monster;
