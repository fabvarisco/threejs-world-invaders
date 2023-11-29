import {
  Vector3,
  Group,
  Box3,
  Mesh,
  Scene,
  Box3Helper,
  Color,
  Object3D,
} from "three";

class GameObject {
  private velocity: Vector3 = new Vector3(0, 0, 0);
  private box3: Box3;
  private speed: number;
  private box3Helper: Box3Helper;
  private removed: boolean = false;
  protected model: Group | Mesh | Object3D;
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number = 0.01
  ) {
    this.model = model;
    this.model.position.set(position.x, position.y, position.z);
    this.speed = speed;
    this.box3 = new Box3().setFromObject(this.model);
    this.box3Helper = new Box3Helper(this.box3, new Color(0xffff00));
  }

  public MoveTo(targetPosition: Vector3): void {
    const direction = new Vector3();
    direction.subVectors(targetPosition, this.model.position);
    direction.normalize();
    this.model.position.addScaledVector(direction, this.speed);
    this.model.position.add(this.velocity);
  }

  public AddScalar(deltaTime: number): void {
    this.model.position.addScaledVector(this.velocity, deltaTime);
  }

  public SetPosition(position: Vector3): void {
    this.model.position.set(position.x, position.y, position.z);
  }

  public ApplyImpulse(impulse: number): void {
    this.velocity.copy(this.model.position.clone().multiplyScalar(impulse));
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

  public DebugDrawBox3(scene: Scene): void {
    scene.add(this.box3Helper);
  }

  public Destroy(scene: Scene) {
    scene.remove(this.model);
    scene.remove(this.box3Helper);
    this.removed = true;
  }

  public isRemoved() {
    return this.removed;
  }

  public SetDestroyTimeOut(scene: Scene, timer: number = 1000) {
    setTimeout(() => {
      this.Destroy(scene);
    }, timer);
  }

  public IntersectBoxWith(other: GameObject): boolean {
    const otherBox = other.GetBox();
    const otherModel = other.GetModel();
    this.box3.setFromObject(this.model);
    otherBox.setFromObject(otherModel);
    if (this.box3.intersectsBox(otherBox)) {
      return true;
    }
    return false;
  }

  public DestroyOnDistance(
    targetDistance: Vector3,
    scene: Scene,
    distanceToDestroy: number
  ) {
    const distance = targetDistance.distanceTo(this.model.position);
    if (distance <= distanceToDestroy) {
      this.Destroy(scene);
    }
  }
}

export default GameObject;
