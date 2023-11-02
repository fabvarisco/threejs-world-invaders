import {
  BufferGeometry,
  Camera,
  DirectionalLight,
  Group,
  HemisphereLight,
  Intersection,
  Line,
  Matrix4,
  Object3D,
  Raycaster,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import {
  DEVICE_POSITION,
  instanceNewSceneObject,
  PARENT_GROUP,
  SCENE_OBJECTS,
} from "@/utils/utils.ts";
import BaseMonster from "@/Assets/SceneObjects/BaseMonster.ts";
import DraggableObject from "@/Assets/SceneObjects/DraggableObject";
import PlayerShoot from "@/Assets/SceneObjects/PlayerShoot.ts";

class AR {
  private readonly scene: Scene;
  private readonly camera: Camera;
  private readonly initSpawnTimer: number;
  private readonly controller: Group;
  private readonly controller2: Group;
  private xrSession: XRSession | null;
  private renderer: WebGLRenderer;
  private xrReferenceSpace: XRReferenceSpace | null | undefined;
  private spawnTimer: number;
  private lastFrameTimestamp: number;
  //private isDragging: boolean;
  //private dragObject: DraggableObject | null;
  private raycaster: Raycaster = new Raycaster();
  // tempMatrix: Matrix4 = new Matrix4();
  private intersected: any[] = [];
  //private parentGroup: Group = new Group();
  private line: Object3D;

  constructor(camera: Camera, renderer: WebGLRenderer) {
    this.scene = new Scene();
    this.camera = camera;
    this.initSpawnTimer = 1000;
    this.spawnTimer = this.initSpawnTimer;
    this.renderer = renderer;
    this.lastFrameTimestamp = 0;
    //this.isDragging = false;
    this.xrSession = null;
    //this.dragObject = null;

    this.scene.add(new HemisphereLight(0x606060, 0x404040));
    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    //Raycast line
    const geometry = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, 0),
      new Vector3(0, 0, -1),
    ]);

    this.line = new Line(geometry);
    this.line.name = "line";
    this.line.scale.z = 40;

    //Controllers
    this.controller = this.renderer.xr.getController(0) as Group;
    this.controller2 = this.renderer.xr.getController(1) as Group;
    this._initControllers();
  }

  _onSelectStart(event: any) {
    console.log(event);
    const controller = event.target;

    const intersections = this._getIntersections(controller);

    if (intersections.length > 0) {
      const intersection = intersections[0];

      const object = intersection.object;
      //object.material.emissive.b = 1;
      controller.attach(object);
      controller.userData.selected = object;
    }

    controller.userData.targetRayMode = event.data.targetRayMode;
  }

  _onSelectEnd(event: any) {
    const controller = event.target;

    if (controller.userData.selected !== undefined) {
      const object = controller.userData.selected;
      object.material.emissive.b = 0;
      PARENT_GROUP.attach(object);

      controller.userData.selected = undefined;
    }
  }

  private _initControllers(): void {
    this.controller.userData.position = this.controller.position;
    this.controller.addEventListener("select", this._onSelect.bind(this));

    //let isDragging = false;

    //   this.controller.addEventListener('squeezestart', () => {
    //     isDragging = true;
    //   });

    //   this.controller2.addEventListener('squeezestart', () => {
    //     isDragging = true;
    //   });

    //   this.controller.addEventListener('squeezeend', () => {
    //     isDragging = false;
    //   });

    //   this.controller2.addEventListener('squeezeend', () => {
    //     isDragging = false;
    //   });

    //   this.controller2.addEventListener('squeezemove', (event) => {
    //     if (this.isDragging && this.dragObject) {
    //       const { controller } = event;
    //       const { matrixWorld } = controller;
    //       this.dragObject.SetMatrix(matrixWorld);
    //     }
    //   });

    // this.controller.addEventListener('squeezemove', (event) => {
    //   if (this.isDragging && this.dragObject) {
    //     const { controller } = event;
    //     const { matrixWorld } = controller;
    //     this.dragObject.SetMatrix(matrixWorld);
    //   }
    // });

    this.controller.add(this.line.clone());
    this.controller2.add(this.line.clone());

    this.controller.addEventListener(
      "selectstart",
      this._onSelectStart.bind(this),
    );
    this.controller.addEventListener("selectend", this._onSelectEnd.bind(this));

    this.controller2.addEventListener(
      "selectstart",
      this._onSelectStart.bind(this),
    );
    this.controller2.addEventListener(
      "selectend",
      this._onSelectEnd.bind(this),
    );

    DEVICE_POSITION.set(
      this.controller.position.x,
      this.controller.position.y,
      this.controller.position.z,
    );

    this.scene.add(this.controller);
    this.scene.add(this.controller2);
  }

  private _onSelect(event: any): void {
    console.log(event);
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

  private _getIntersections(
    controller: Group,
  ): Intersection<Object3D<Event>>[] {
    const tempMatrix = new Matrix4();

    controller.updateMatrixWorld();

    tempMatrix.identity().extractRotation(controller.matrixWorld);

    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    return this.raycaster.intersectObjects(PARENT_GROUP.children, false);
  }

  private _intersectObjects(controller: Group): void {
    if (controller.userData.targetRayMode === "screen") return;

    // Do not highlight when already selected

    if (controller.userData.selected !== undefined) return;
    const line = controller.getObjectByName("line");
    const intersections = this._getIntersections(controller);

    if (intersections.length > 0) {
      const intersection = intersections[0];

      const object = intersection.object;
      //object.material.emissive.r = 1;
      this.intersected.push(object);

      line!.scale!.z = intersection.distance;
    } else {
      line!.scale!.z = 40;
    }
  }

  private _cleanIntersected(): void {
    while (this.intersected.length) {
      const object = this.intersected.pop();
      if (object) {
        object.material.emissive.r = 0;
      }
    }
  }

  spawnMonster(): void {
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
    instanceNewSceneObject("BaseMonster", BaseMonster, this.scene, {
      position: position,
    });
  }

  spawnDraggable(): void {
    const minX = -2;
    const maxX = 2;
    const minY = 0;
    const maxY = 2;
    const minZ = -2;
    const maxZ = 2;

    const position: Vector3 = new Vector3(0, 0, 0);
    position.x = Math.random() * (maxX - minX) + minX;
    position.y = Math.random() * (maxY - minY) + minY;
    position.z = Math.random() * (maxZ - minZ) + minZ;
    instanceNewSceneObject("DraggableObject", DraggableObject, this.scene, {
      position: position,
    });
  }

  private _resetSpawnTimer(): void {
    this.spawnTimer = Math.random() * (1000 - 3000) + 3000;
  }

  Render(timestamp: any, frame: any): void {
    const deltaTime = timestamp - this.lastFrameTimestamp;
    this.lastFrameTimestamp = timestamp;
    SCENE_OBJECTS.forEach((obj) => {
      obj.Render();
    });
    this._cleanIntersected();
    this._intersectObjects(this.controller);
    this._intersectObjects(this.controller2);

    if (this.spawnTimer <= 0) {
      this.spawnMonster();
      this.spawnDraggable();
      this._resetSpawnTimer();
    }
    if (!this.xrSession) {
      const session = this.renderer.xr.getSession();
      session
        ?.requestReferenceSpace("viewer")
        .then((xrReferenceSpace) => {
          this.xrReferenceSpace = xrReferenceSpace;
          this.xrSession = session;
          debugger;
          this.xrSession.addEventListener("end", this.endSession.bind(this));
        })
        .catch((error) => {
          console.error("Failed to create XR session: ", error);
        });
    }

    if (this.xrReferenceSpace && this.xrSession && frame) {
      const {
        transform: { position },
      } = frame?.getViewerPose(this.xrReferenceSpace);
      if (position) {
        DEVICE_POSITION.set(position.x, position.y, position.z);
      }
    }
    this.spawnTimer -= deltaTime;

    this.renderer.render(this.scene, this.camera);
  }

  private endSession() {
    location.reload();
  }

  Destroy(): void {}
}

export default AR;
