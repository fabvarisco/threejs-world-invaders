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
  private monsters: Mesh[];

  private readonly geometry: BufferGeometry;
  private readonly controller: Group;
  constructor(scene: Scene, renderer: WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.geometry = new BoxGeometry(0.06, 0.06, 0.06);
    this.meshes = [];
    this.monsters = [];
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

    this.spawnMonster();
    this.spawnMonster();
    this.spawnMonster();
    this.spawnMonster();
    this.spawnMonster();
    this.spawnMonster();
    this.spawnMonster();
    this.spawnMonster();
    console.log(this.controller);
  }

  spawnMonster() {
    const material = new MeshPhongMaterial({
      color: 0xffffff * Math.random(),
    });
    const monster = new Mesh(this.geometry, material);
    const minX = -5; // Limite mínimo X
    const maxX = 5; // Limite máximo X
    const minY = 0; // Limite mínimo Y (altura)
    const maxY = 2; // Limite máximo Y (altura)
    const minZ = -5; // Limite mínimo Z
    const maxZ = 5; // Limite máximo Z

    monster.position.x = Math.random() * (maxX - minX) + minX;
    monster.position.y = Math.random() * (maxY - minY) + minY;
    monster.position.z = Math.random() * (maxZ - minZ) + minZ;
    this.monsters.push(monster);
    this.scene.add(monster);
  }

  updateMonster(monster: any) {
    const speed = 0.01;

    const direction = new Vector3();
    direction.subVectors(this.controller.position, monster.position);
    direction.normalize();

    monster.position.addScaledVector(direction, speed);
  }

  //@ts-ignore
  Render(timestamp: any, frame: any) {
    this.meshes.forEach((cube, index) => {
      cube.position.add(cube.userData.velocity);

      if (cube.position.distanceTo(this.controller.position) < 0.05) {
        this.scene.remove(cube);
        this.meshes.splice(index, 1);
      }
    });

    this.monsters.forEach((monster) => {
      this.updateMonster(monster);
    });
  }
}

export default AR;
