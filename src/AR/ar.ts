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
import {
  DEVICE_POSITION,
  instanceNewSceneObject,
  SCENE_OBJECTS,
} from "@/utils/utils.ts";
import Bee from "@/Assets/SceneObjects/Bee.ts";

class AR {
  private readonly scene: Scene;
  private xrSession: XRSession | null;
  private readonly geometry: BufferGeometry;
  private readonly controller: Group;
  private renderer: WebGLRenderer;
  private meshes: Mesh[];
  private xrReferenceSpace: XRReferenceSpace | null | undefined;
  private spawnTimer: number;
  private readonly initSpawnTimer: number;
  constructor(scene: Scene, renderer: WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.xrSession = null;

    this.initSpawnTimer = 1000;
    this.spawnTimer = this.initSpawnTimer;

    this.geometry = new BoxGeometry(0.06, 0.06, 0.06);
    this.meshes = [];
    this.controller = this.renderer.xr.getController(0) as Group;
    this.controller.userData.position = this.controller.position;
    this.controller.addEventListener("select", this._onSelect.bind(this));

    DEVICE_POSITION.set(
      this.controller.position.x,
      this.controller.position.y,
      this.controller.position.z,
    );

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

  spawnMonster() {
    const minX = -5;
    const maxX = 5;
    const minY = 0;
    const maxY = 2;
    const minZ = -5;
    const maxZ = 5;

    const position: Vector3 = new Vector3(0, 0, 0);
    position.x = Math.random() * (maxX - minX) + minX;
    position.y = Math.random() * (maxY - minY) + minY;
    position.z = Math.random() * (maxZ - minZ) + minZ;
    instanceNewSceneObject("Bee", position, Bee, this.scene);
  }

  // private async initSession() {
  //   this.xrSession = this.renderer.xr.getSession();
  //   this.xrReferenceSpace =
  //     await this.xrSession?.requestReferenceSpace("viewer");
  //
  //   const onEnd = () => {
  //     this.xrReferenceSpace = null;
  //   };
  //   console.log("this.xrSession");
  //
  //   console.log(this.xrSession);
  //   this.xrSession?.addEventListener("end", onEnd.bind(this));
  // }

  //@ts-ignore
  Render(timestamp: any, frame: any) {
    for (const obj of SCENE_OBJECTS) {
      obj.Render();
    }
    if (this.spawnTimer <= 0) {
      this.spawnMonster();
      this.spawnTimer = this.initSpawnTimer;
    }
    if (!this.xrSession) {
      const session = this.renderer.xr.getSession();
      session
        ?.requestReferenceSpace("local")
        .then((xrReferenceSpace) => {
          this.xrReferenceSpace = xrReferenceSpace;
          this.xrSession = session;
        })
        .catch((error) => {
          console.error("Failed to create XR session: ", error);
        });
    }

    if (this.xrReferenceSpace) {
      const {
        transform: { position },
      } = frame.getViewerPose(this.xrReferenceSpace);

      if (position) {
        DEVICE_POSITION.set(position.x, position.y, position.z);
      }
    }
    this.meshes.forEach((cube, index) => {
      cube.position.add(cube.userData.velocity);
      if (cube.position.distanceTo(this.controller.position) < 0.05) {
        this.scene.remove(cube);
        this.meshes.splice(index, 1);
      }
    });
    this.spawnTimer -= 1;
  }
}

export default AR;
