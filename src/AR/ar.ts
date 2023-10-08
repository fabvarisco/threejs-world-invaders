import { Group, Scene, Vector3, WebGLRenderer } from "three";
import {
  DEVICE_POSITION,
  instanceNewSceneObject,
  SCENE_OBJECTS,
} from "@/utils/utils.ts";
import Bee from "@/Assets/SceneObjects/Bee.ts";
import PlayerShoot from "@/Assets/SceneObjects/PlayerShoot.ts";
import ArOverlay from "@/Overlay/AR/ArOverlay.ts";

class AR {
  private readonly scene: Scene;
  private xrSession: XRSession | null;
  private readonly controller: Group;
  private renderer: WebGLRenderer;
  private xrReferenceSpace: XRReferenceSpace | null | undefined;
  private spawnTimer: number;
  private readonly initSpawnTimer: number;
  private arOverlay: ArOverlay;
  constructor(scene: Scene, renderer: WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.xrSession = null;

    this.initSpawnTimer = 1000;
    this.spawnTimer = this.initSpawnTimer;

    this.controller = this.renderer.xr.getController(0) as Group;
    this.controller.userData.position = this.controller.position;
    this.controller.addEventListener("select", this._onSelect.bind(this));
    DEVICE_POSITION.set(
      this.controller.position.x,
      this.controller.position.y,
      this.controller.position.z,
    );

    this.scene.add(this.controller);
    this.arOverlay = new ArOverlay();
  }

  private _onSelect() {
    const position = new Vector3()
      .set(0, 0, -0.3)
      .applyMatrix4(this.controller.matrixWorld);
    const velocity = new Vector3(0, 0, -0.1);
    velocity.x = (Math.random() - 0.5) * 0.02;
    velocity.y = (Math.random() - 0.5) * 0.02;
    velocity.z = Math.random() * 0.01 - 0.05;
    velocity.applyQuaternion(this.controller.quaternion);
    instanceNewSceneObject("PlayerShoot", PlayerShoot, this.scene, {
      position,
      velocity,
      controller: this.controller,
    });
  }

  spawnMonster() {
    const minX = -10;
    const maxX = 10;
    const minY = 0;
    const maxY = 10;
    const minZ = -10;
    const maxZ = 10;

    const position: Vector3 = new Vector3(0, 0, 0);
    position.x = Math.random() * (maxX - minX) + minX;
    position.y = Math.random() * (maxY - minY) + minY;
    position.z = Math.random() * (maxZ - minZ) + minZ;
    instanceNewSceneObject("Bee", Bee, this.scene, { position: position });
  }

  //@ts-ignore
  Render(timestamp: any, frame: any) {
    SCENE_OBJECTS.forEach((obj) => {
      obj.Render();
    });

    if (this.spawnTimer <= 0) {
      this.spawnMonster();
      this.spawnMonster();
      this.spawnMonster();
      this.spawnMonster();
      this.spawnMonster();
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
          this.xrSession.addEventListener("end", (event) => console.log(event));
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
    this.spawnTimer -= 1;
    this.arOverlay.Render();
  }

  Destroy() {}
}

export default AR;
