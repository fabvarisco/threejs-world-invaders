import {
  BoxGeometry,
  BufferGeometry,
  Group,
  Mesh,
  MeshPhongMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";

class AR {
  private scene: Scene;
  private renderer: WebGLRenderer;
  private meshes: Mesh[];
  private geometry: BufferGeometry;
  private controller: Group;
  constructor(scene: Scene, renderer: WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.geometry = new BoxGeometry(0.06, 0.06, 0.06);
    this.meshes = [];

    this.controller = this.renderer.xr.getController(0) as Group;
    this.controller.addEventListener("select", this._onSelect.bind(this));
    this.scene.add(this.controller);
  }

  private _onSelect() {
    const material = new MeshPhongMaterial({
      color: 0xffffff * Math.random(),
    });
    const mesh = new Mesh(this.geometry, material);
    mesh.position.set(0, 0, -0.3).applyMatrix4(this.controller.matrixWorld);
    mesh.quaternion.setFromRotationMatrix(this.controller.matrixWorld);
    mesh.userData.velocity = new Vector3(0, 0, -0.1);
    mesh.userData.velocity.x = (Math.random() - 0.5) * 0.02;
    mesh.userData.velocity.y = (Math.random() - 0.5) * 0.02;
    mesh.userData.velocity.z = Math.random() * 0.01 - 0.05;
    mesh.userData.velocity.applyQuaternion(this.controller.quaternion);
    this.scene.add(mesh);
    this.meshes.push(mesh);
  }
  //@ts-ignore
  Render(timestamp: any, frame: any) {
    this.meshes.forEach((cube, index) => {
      cube.position.add(cube.userData.velocity);

      // Check for collision with hand or other objects
      if (cube.position.distanceTo(this.controller.position) < 0.05) {
        // Handle collision logic (e.g., remove cube, increase score)
        this.scene.remove(cube);
        this.meshes.splice(index, 1);
      }
    });
  }
}

export default AR;
