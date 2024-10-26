import {
  Vector3,
  Group,
  Box3,
  Mesh,
  Scene,
  Box3Helper,
  Color,
  Object3D,
  Sphere,
  IcosahedronGeometry,
  WireframeGeometry,
  LineBasicMaterial,
  LineSegments,
} from "three";
import { Octree } from "three/examples/jsm/math/Octree.js";

class GameObject {
  protected box3: Box3;
  protected speed: number;
  protected box3Helper: Box3Helper;
  protected removed: boolean = false;
  protected velocity: Vector3 = new Vector3(0, 0, 0);
  protected model: Group | Mesh | Object3D;
  protected scene: Scene;
  protected timeout: any;
  protected boundingSphere: any;

  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number = 0.01,
    scene: Scene
  ) {
    this.model = model;
    this.model.position.set(position.x, position.y, position.z);
    this.speed = speed;
    this.scene = scene;
    this.box3 = new Box3().setFromObject(this.model);
    this.box3Helper = new Box3Helper(this.box3, new Color(0xffff00));
    this.boundingSphere = new Sphere(this.model.position, 0.2);
    console.log(this.boundingSphere);
    const wireframeGeometry = new WireframeGeometry(
      new IcosahedronGeometry(this.boundingSphere.radius, 4)
    );
    const wireframeMaterial = new LineBasicMaterial({ color: 0xff0000 });
    const boundingSphereHelper = new LineSegments(
      wireframeGeometry,
      wireframeMaterial
    );

    boundingSphereHelper.position.copy(this.boundingSphere.center);
    this.scene.add(boundingSphereHelper);
  }

  public MoveTo(targetPosition: Vector3, deltaTime: number): void {
    const direction = new Vector3();
    direction.subVectors(targetPosition, this.model.position);
    direction.normalize();
    this.model.position.addScaledVector(direction, this.speed * deltaTime);
    this.model.position.add(this.velocity);
  }

  public AddScalar(_deltaTime: number): void {
    this.model.position.addScaledVector(this.velocity, _deltaTime);
  }

  public SetPosition(position: Vector3): void {
    this.model.position.copy(position);
  }

  public ApplyImpulse(impulse: number): void {
    this.velocity.copy(
      this.model.position.clone().multiplyScalar(impulse * this.speed)
    );
  }

  public SetVelocity(velocity: Vector3): void {
    this.velocity = velocity;
  }

  public LookTo(targetLookPosition: Vector3): void {
    this.model.lookAt(targetLookPosition);
  }

  public SetScale(scale: number): void {
    this.model.scale.set(scale, scale, scale);
  }

  public SetSpeed(speed: number): void {
    this.speed = speed;
  }

  public GetModel() {
    return this.model;
  }
  public GetBox() {
    return this.box3;
  }

  public DebugDrawBox3(): void {
    this.scene.add(this.box3Helper);
  }

  public Destroy() {
    if (this.removed) return; // Prevent multiple calls to Destroy

    // Remove from the scene
    this.scene.remove(this.model);
    this.scene.remove(this.box3Helper);

    // Dispose of the model's geometry and material if they exist
    if (this.model instanceof Mesh) {
      if (this.model.geometry) {
        this.model.geometry.dispose();
      }
      if (this.model.material) {
        if (Array.isArray(this.model.material)) {
          this.model.material.forEach((mat) => mat.dispose());
        } else {
          this.model.material.dispose();
        }
      }
    }

    // Clear the timeout if set
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Mark the object as removed
    this.removed = true;

    // Optional: Set references to null to assist with garbage collection
    // this.model = null;
    // this.velocity = null;
    // this.box3 = null;
    // this.box3Helper = null;
    // this.scene = null;
  }

  public IsRemoved() {
    return this.removed;
  }

  public SetDestroyTimeOut(timer: number = 1000) {
    this.timeout = setTimeout(() => {
      this.Destroy();
      console.log("TIMEOUT");
    }, timer);
  }

  public IntersectsWith(other: GameObject): boolean {
    return this.boundingSphere.intersectsSphere(other.boundingSphere);
  }

  public IntersectBoxWithWorld(_other: Octree): boolean {
    // this.box3.setFromObject(this.model);

    // if (this.box3.intersectsBox(otherBox)) {
    //   return true;
    // }
    return false;
  }

  public DestroyOnDistance(targetDistance: Vector3, distanceToDestroy: number) {
    const distance = targetDistance.distanceTo(this.model.position);
    if (distance <= distanceToDestroy) {
      this.Destroy();
    }
  }

  public Update(_deltaTime: number): void {}
}

export default GameObject;
