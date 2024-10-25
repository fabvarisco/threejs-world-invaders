import {
  Color,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  Scene,
  Sphere,
  Vector3,
  WireframeGeometry,
  LineSegments,
  LineBasicMaterial
} from "three";
import GameObject from "./GameObject";
import { Octree } from "three/examples/jsm/math/Octree.js";
import WorldWebGameObject from "./WorldWebGameObject";

class ShootGameObject extends GameObject {
  private _color: Color | null;
  private _collider: Sphere;
  private _colliderHelper: LineSegments | null = null;

  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number,
    scene: Scene,
    color?: Color
  ) {
    super(model, position, speed, scene);
    this._color = color || new Color(0xdede8d);
    this._collider = new Sphere(model.position, 0.1);
    this._createMesh();
    this._createColliderHelper();
    this.SetDestroyTimeOut(1000);
  }

  private _createMesh() {
    const _shootGeometry = new IcosahedronGeometry(0.1, 5);
    const _playerShootMaterial = new MeshLambertMaterial({
      color: this._color!,
    });
    this.model = new Mesh(_shootGeometry, _playerShootMaterial);
    this.model.castShadow = true;
    this.model.receiveShadow = true;
  }

  private _createColliderHelper() {
    const wireframeGeometry = new WireframeGeometry(new IcosahedronGeometry(this._collider.radius, 4));
    const wireframeMaterial = new LineBasicMaterial({ color: 0xff0000 });
    this._colliderHelper = new LineSegments(wireframeGeometry, wireframeMaterial);
    
    this._colliderHelper.position.copy(this._collider.center);
    this.scene.add(this._colliderHelper);
  }

  public Update(_deltaTime: number): void {
    this.AddScalar(_deltaTime);

    const deltaPosition = this.velocity.clone().multiplyScalar(_deltaTime);
    this._collider.center.add(deltaPosition);

    if (this._colliderHelper) {
      this._colliderHelper.position.copy(this._collider.center);
    }
  }

  public WorldCollision(webWorld: WorldWebGameObject) {
    const result = webWorld.GetOctree().sphereIntersect(this._collider);

    if (result) {
      this.Destroy();
    }
  }

  public Destroy(): void {
    super.Destroy()
    this.scene.remove(this._colliderHelper!);
    this._colliderHelper!.geometry.dispose();
    (this._colliderHelper!.material as LineBasicMaterial).dispose();
    this._colliderHelper = null;
  }
}

export default ShootGameObject;
