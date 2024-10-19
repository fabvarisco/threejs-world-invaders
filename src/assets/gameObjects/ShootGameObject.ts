import { Group, IcosahedronGeometry, Mesh, MeshLambertMaterial, Object3D, Scene, Vector3 } from "three";
import GameObject from "./GameObject";

class ShootGameObject extends GameObject {
  constructor(
    model: Group | Mesh | Object3D,
    position: Vector3,
    speed: number,
    scene: Scene
  ) {
    super(model, position, speed, scene);
    this._createMesh();
  }

  private _createMesh(){
    const _shootGeometry = new IcosahedronGeometry(0.1, 5);
    const _playerShootMaterial = new MeshLambertMaterial({
      color: 0xdede8d,
    });
    this.model = new Mesh(
        _shootGeometry,
        _playerShootMaterial
      );
      this.model.castShadow = true;
      this.model.receiveShadow = true;
  }

  public Update(_deltaTime: number): void {
    this.AddScalar(_deltaTime);
  }

}


export default ShootGameObject;