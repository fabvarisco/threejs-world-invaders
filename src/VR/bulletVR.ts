import {
  EventDispatcher,
  Matrix4,
  Mesh,
  Object3D,
  Quaternion,
  Raycaster,
  Vector3,
} from "three";

class BulletVR extends EventDispatcher {
  private mesh: Mesh;
  private offset: Vector3;
  private gun: Object3D;
  private targets: Object3D[];
  private distanceLimit: number;
  private workingVec3: Vector3;
  private workingQuat: Quaternion;
  private workingMat4: Matrix4;
  private raycaster: Raycaster;
  private firing: boolean;
  private distanceTravelled: number;

  constructor(mesh: Mesh, options: { gun: Object3D; targets: Object3D[] }) {
    super();

    this.mesh = mesh;
    mesh.visible = false;

    this.offset = mesh.position.clone();
    this.gun = options.gun;
    this.targets = options.targets;
    this.distanceLimit = 20;
    this.workingVec3 = new Vector3();
    this.workingQuat = new Quaternion();
    this.workingMat4 = new Matrix4();
    this.raycaster = new Raycaster();
    this.firing = false;
    this.distanceTravelled = 0;
  }

  fire() {
    if (this.firing) return;

    this.workingMat4.identity().extractRotation(this.gun.matrixWorld);
    this.gun.getWorldPosition(this.workingVec3);
    this.workingVec3.add(this.offset);
    this.gun.getWorldQuaternion(this.workingQuat);

    this.raycaster.ray.origin.copy(this.workingVec3);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.workingMat4);

    this.mesh.position.copy(this.workingVec3);
    this.mesh.quaternion.copy(this.workingQuat);

    this.mesh.visible = true;

    this.distanceTravelled = 0;
    this.firing = true;
  }

  update(dt: number) {
    if (this.firing) {
      const dist = 10 * dt;

      let complete = false;

      this.raycaster.ray.origin.copy(this.mesh.position);

      const intersects = this.raycaster.intersectObjects(this.targets);

      if (intersects.length > 0) {
        const intersect = intersects[0];

        if (intersect.distance < dist) {
          const index = this.targets.indexOf(intersect.object);
          this.targets.splice(index, 1);

          this.dispatchEvent({ type: "hit", hitObject: intersect.object });
          complete = true;
        }
      }

      this.mesh.translateZ(-dist);
      this.distanceTravelled += dist;

      if (this.distanceTravelled > this.distanceLimit) complete = true;

      if (complete) {
        this.firing = false;
        this.mesh.visible = false;
      }
    }
  }
}

export default BulletVR;
