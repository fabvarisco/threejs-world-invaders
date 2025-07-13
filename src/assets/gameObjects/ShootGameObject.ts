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
  LineBasicMaterial,
  Box3,
  Box3Helper,
} from "three";
import GameObject from "./GameObject";
import { Octree } from "three/examples/jsm/math/Octree.js";
import WorldWebGameObject from "./WorldWebGameObject";

class ShootGameObject extends GameObject {
  private _color: Color | null;
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number,
    scene: Scene,
    color?: Color
  ) {
    super(model, position, speed, scene);
    this._color = color || new Color(0xdede8d);
    this._createMesh();
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
    this.CreateBox();
  }

  public Update(_deltaTime: number): void {
    this.AddScalar(_deltaTime);
    this.box3?.setFromObject(this.model)
    this.box3Helper?.updateMatrix(); 
  }
}

export default ShootGameObject;
