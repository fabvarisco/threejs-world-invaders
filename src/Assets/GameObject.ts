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
  private model: Group | Mesh | Object3D;
  private position: Vector3 = new Vector3();
  private speed: number = 0.01;
  constructor(model: Group | Mesh | Object3D, position: Vector3) {
    this.model = model;
    this.position = position;
    this.box3 = new Box3().setFromObject(this.model);
    this._init();
  }

  private _init(): void {
    this.model.position.set(this.position.x, this.position.y, this.position.z);
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

  public SetVelocity(impulse: number): void {
    this.velocity.copy(this.position.clone().multiplyScalar(impulse));
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
    const boxHelper = new Box3Helper(this.box3, new Color(0xffff00));
    scene.add(boxHelper);
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
}

export default GameObject;
