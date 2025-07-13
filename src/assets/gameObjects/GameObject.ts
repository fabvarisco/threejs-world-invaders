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
  protected speed: number;
  protected removed: boolean = false;
  protected velocity: Vector3 = new Vector3(0, 0, 0);
  protected model: Group | Mesh | Object3D;
  protected scene: Scene;
  protected timeout: any;
  protected box3?: Box3;
  protected box3Helper?: Box3Helper;

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
  }

  public CreateBox() {
    this.box3 = new Box3().setFromObject(this.model);
    this.box3Helper = new Box3Helper(this.box3, new Color(0xffff00));
    this.DebugDrawBox3();
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
  public GetBox(): Box3 | undefined {
    return this.box3;
  }

  public DebugDrawBox3(): void {
    if (!this.box3Helper) return;
    this.scene.add(this.box3Helper);
  }

  public Destroy() {
    if (this.removed) return;

    this.scene.remove(this.model);
    if (this.box3Helper) this.scene.remove(this.box3Helper);

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

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.removed = true;
  }

  public IsRemoved() {
    return this.removed;
  }

  public SetDestroyTimeOut(timer: number = 1000) {
    this.timeout = setTimeout(() => {
      this.Destroy();
    }, timer);
  }

  public IntersectsWith(other: GameObject): boolean {
    if (!other?.GetBox()) return false;
    this.box3?.setFromObject(this.model);

    if (this.box3?.intersectsBox(other.GetBox()!)) {
      return true;
    }
    return false;
  }


  public DestroyOnDistance(targetDistance: Vector3, distanceToDestroy: number) {
    const distance = targetDistance.distanceTo(this.model.position);
    if (distance <= distanceToDestroy) {
      this.Destroy();
    }
  }

  public Update(_deltaTime: number): void {
    this.box3?.setFromObject(this.model);
    this.box3Helper?.updateMatrix();
  }
}

export default GameObject;
