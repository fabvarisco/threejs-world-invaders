import {
  BufferGeometry,
  Camera,
  Clock,
  DirectionalLight,
  Group,
  HemisphereLight,
  Line,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
  Object3D,
  Color,
} from "three";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import GameObject from "../assets/gameObjects/GameObject";
import { CreateStars } from "../utils/utils";
import InvaderGameObject from "../assets/gameObjects/InvaderGameObject";
import { Block, Text, update } from "three-mesh-ui";
import GreenInvaderGameObject from "../assets/gameObjects/GreenInvaderGameObject";

class VR {
  private readonly scene: Scene = new Scene();
  private readonly camera: Camera;
  private renderer: WebGLRenderer;
  private controllers: Group[] = [];
  private intersection: any;
  private tempMatrix: Matrix4 = new Matrix4();
  private raycaster: Raycaster = new Raycaster();
  private readonly floor: Mesh;
  private projectiles: GameObject[] = [];
  private invaders: InvaderGameObject[] = [];
  private greenInvaders: GreenInvaderGameObject[] = [];
  private spawnTime: number = 1;
  private timer: number = 1;
  private readonly prefabs: Map<string, Object3D>;
  private clock: Clock = new Clock();
  private baseReferenceSpace: XRReferenceSpace | null | undefined;
  private gun: GameObject | null = null;
  private restartButton: Block;
  constructor(
    camera: Camera,
    renderer: WebGLRenderer,
    prefabs: Map<string, Object3D>
  ) {
    this.camera = camera;
    this.prefabs = prefabs;
    this.renderer = renderer;

    this.scene.add(new HemisphereLight(0x606060, 0x404040));

    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    CreateStars(this.scene);

    const floorGeometry = new PlaneGeometry(20, 20);
    const floorMaterial = new MeshStandardMaterial({ color: 0x666666 });
    this.floor = new Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    this.floor.name = "floor";
    this.scene.add(this.floor);

    this.renderer.xr.addEventListener(
      "sessionstart",
      this.onSessionStart.bind(this)
    );

    // Create VR GUI
    const container = new Block({
      width: 1.8,
      height: 0.5,
      padding: 0.05,
      justifyContent: "center",
      textAlign: "center",
      fontFamily: "./fonts/Roboto-msdf.json",
      fontTexture: "./fonts/Roboto-msdf.png",
    });

    container.position.set(0, 1, -1.8);
    container.rotation.x = -0.55;
    const text = new Text({
      content: "Grab the gun and survive!",
    });

    container.add(text);

    //Restart button
    const buttonOptions = {
      width: 0.4,
      height: 0.15,
      justifyContent: "center",
      offset: 0.05,
      margin: 0.02,
      borderRadius: 0.075,
    };

    const hoveredStateAttributes = {
      state: "hovered",
      attributes: {
        offset: 0.035,
        backgroundColor: new Color(0x999999),
        backgroundOpacity: 1,
        fontColor: new Color(0xffffff),
      },
    };

    const idleStateAttributes = {
      state: "idle",
      attributes: {
        offset: 0.035,
        backgroundColor: new Color(0x666666),
        backgroundOpacity: 0.3,
        fontColor: new Color(0xffffff),
      },
    };

    const selectedAttributes = {
      offset: 0.02,
      backgroundColor: new Color(0x777777),
      fontColor: new Color(0x222222),
    };

    this.restartButton = new Block(buttonOptions);
    this.restartButton.name = "restart";
    this.restartButton.add(new Text({ content: "Restart" }));

    //@ts-ignore
    this.restartButton.setupState({
      state: "selected",
      attributes: selectedAttributes,
      onSet: () => {
        location.reload();
      },
    });

    //@ts-ignore
    this.restartButton.setupState(hoveredStateAttributes);
    //@ts-ignore
    this.restartButton.setupState(idleStateAttributes);

    container.add(this.restartButton);
    this.scene.add(container);

    this._buildControllers();
    this._createGun();
    this.renderer.setAnimationLoop(this._animate.bind(this));
  }

  private onSessionStart(): void {
    this.baseReferenceSpace = this.renderer.xr.getReferenceSpace();
  }

  private _buildControllers(): void {
    const self = this;
    const controllerModelFactory = new XRControllerModelFactory();

    const geometry = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, 0),
      new Vector3(0, 0, -1),
    ]);

    const line = new Line(geometry);
    line.name = "ray";
    line.scale.z = 10;

    const geometry2 = new SphereGeometry(0.03, 8, 6);
    const material = new MeshBasicMaterial({ color: 0xff0000 });

    const controllers = [];

    for (let i = 0; i <= 1; i++) {
      const controller = this.renderer.xr.getController(i);
      controller.userData.index = i;
      controller.userData.selectPressed = false;
      controller.add(line.clone());
      controller.userData.marker = this.createMarker(geometry2, material);
      controller.userData.hasGun = false;
      controllers.push(controller);

      const grip = this.renderer.xr.getControllerGrip(i);
      grip.add(controllerModelFactory.createControllerModel(grip));
      controller.userData.grip = grip;
    }

    this.controllers = controllers;

    function onSelectStart(this: any): void {
      this.userData.selectPressed = true;
    }

    function onSelectEnd(this: any): void {
      this.userData.selectPressed = false;
      this.userData.marker.visible = false;
      if (this.userData.hasGun) return;

      if (self.intersection) {
        const offsetPosition = {
          x: -self.intersection.point.x,
          y: -self.intersection.point.y,
          z: -self.intersection.point.z,
          w: 1,
        };
        const offsetRotation = new Quaternion();
        const transform = new XRRigidTransform(offsetPosition, offsetRotation);
        const teleportSpaceOffset =
          self.baseReferenceSpace?.getOffsetReferenceSpace(transform);
        if (teleportSpaceOffset) {
          self.renderer.xr.setReferenceSpace(teleportSpaceOffset);
        }
      }
    }

    function onSqueezeStart(this: any): void {
      this.userData.squeezePressed = true;
    }

    function onSqueezeEnd(this: any): void {
      this.userData.squeezePressed = false;
    }

    this.controllers.forEach((controller: Group): void => {
      controller.addEventListener("selectstart", onSelectStart);
      controller.addEventListener("selectend", onSelectEnd);
      controller.addEventListener("squeezestart", onSqueezeStart);
      controller.addEventListener("squeezeend", onSqueezeEnd);
      this.scene.add(controller.userData.grip);
      this.scene.add(controller.userData.marker);
      this.scene.add(controller);
    });
  }
  private _shoot(): void {
    const controllerWithGun = this.controllers.find(
      (controller) => controller.userData.hasGun
    );

    if (controllerWithGun) {
      const gun = controllerWithGun.userData.grip;

      const projectileGeometry = new SphereGeometry(0.05, 8, 6);
      const projectileMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
      const projectileMesh = new Mesh(projectileGeometry, projectileMaterial);
      const gunDirection = new Vector3(0, 0, 1);
      const gunPosition = new Vector3();

      gun.getWorldPosition(gunPosition);
      gun.getWorldDirection(gunDirection);

      const projectileVelocity = gunDirection.clone().multiplyScalar(20);
      const projectileStartPosition = gunPosition
        .clone()
        .add(gunDirection.clone().multiplyScalar(0.1));

      const projectile = new GameObject(
        projectileMesh,
        projectileStartPosition,
        0.01,
        this.scene
      );

      projectile.GetModel().position.copy(projectileStartPosition);
      projectile.SetVelocity(projectileVelocity);

      this.scene.add(projectile.GetModel());

      this.projectiles.push(projectile);
    }
  }

  private _updateProjectile(deltaTime: number) {
    this.projectiles.forEach((el) => {
      el.AddScalar(deltaTime);
    });
  }

  private _updateCollisions(): void {
    for (let i = 0; i < this.projectiles.length; i++) {
      for (let j = 0; j < this.invaders.length; j++) {
        const sphere = this.projectiles[i];
        const invader = this.invaders[j];

        if (invader.IntersectsWith(sphere)) {
          sphere.Destroy();
          this.projectiles.splice(i, 1);

          invader.Destroy();
          this.invaders.splice(j, 1);

          i--;
          j--;
        }
      }
    }
  }
  private _updateInvaders(_deltaTime: number): void {
    this.invaders.forEach((el, index, object) => {
      if (el.IsRemoved()) {
        object.splice(index, 1);
      }
      el.Update(_deltaTime);
    });
  }

  private _createGun() {
    const newGun = new GameObject(
      this.prefabs.get("gun")!,
      new Vector3(-0.5, 1.5, -1.0),
      0.6,
      this.scene
    );
    const gunModel = newGun.GetModel();
    const self = this;

    gunModel.rotation.set(0, Math.PI, 0);
    gunModel.position.set(-0.5, 1.5, -1.0);
    gunModel.children[0].children[0].name = "gun";

    this.gun = newGun;

    this.scene.add(gunModel);

    this.controllers.forEach((controller: Group): void => {
      controller.addEventListener("squeezeend", function () {
        self.scene.attach(self.gun?.GetModel()!);
        controller.userData.hasGun = false;
      });
      controller.addEventListener("selectstart", function () {
        if (controller.userData.hasGun) {
          self._shoot();
        }
      });
    });
  }

  private _playerUpdate() {
    for (let i = 0; i < this.invaders.length; i++) {
      const invader = this.invaders[i];
      if (invader.GetModel().position.distanceTo(this.camera.position) <= 1) {
        console.log("Take damage")
        debugger
        invader.Destroy();
      }
    }
  }

  private _spawnInvader(): void {
    const minX = -60;
    const maxX = 60;
    const minY = 10;
    const maxY = 60;
    const minZ = -60;
    const maxZ = 60;

    const position: Vector3 = new Vector3(0, 0, 0);
    position.x = Math.random() * (maxX - minX) + minX;
    position.y = Math.random() * (maxY - minY) + minY;
    position.z = Math.random() * (maxZ - minZ) + minZ;
    const invaderModel: Object3D = this.prefabs.get("invader")!.clone();
    const newInvader = new InvaderGameObject(
      invaderModel,
      position,
      3,
      this.scene
    );

    this.invaders.push(newInvader);
    this.scene.add(newInvader.GetModel());
  }

  private createMarker(geometry: SphereGeometry, material: MeshBasicMaterial) {
    const mesh = new Mesh(geometry, material);
    mesh.visible = false;
    this.scene.add(mesh);
    return mesh;
  }

  public _animate(): void {
    this.intersection = undefined;
    this.controllers.forEach((controller: Group) => {
      this.tempMatrix.identity().extractRotation(controller.matrixWorld);
      this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);

      const intersects = this.raycaster.intersectObjects([
        this.floor,
        this.gun?.GetModel()!,
      ]);
      if (intersects.length > 0) {
        this.intersection = intersects[0];
        controller.userData.marker.visible =
          controller.userData.marker.position.copy(this.intersection?.point);
      } else {
        controller.userData.marker.visible = false;
      }
      if (controller.userData.selectPressed === true && this.intersection) {
        if (
          this.intersection.object.name === "floor" &&
          !controller.userData.hasGun
        ) {
        }
        if (
          this.intersection.object.name === "restart" &&
          !controller.userData.hasGun
        ) {
          if (this.intersection && !controller.userData.hasGun) {
            controller.userData.marker.position.copy(this.intersection?.point);
          }
        }
        if (this.intersection.object.name === "gun") {
          this.gun?.GetModel()!.position.set(-0.15, 0, -0.2);
          this.gun?.GetModel()!.quaternion.identity();
          this.gun?.GetModel()!.rotateY(Math.PI);
          controller.add(this.gun?.GetModel()!);
          controller.userData.hasGun = true;
          controller.userData.grip = this.gun?.GetModel()!;
        }
      }
    });

    const deltaTime = Math.min(0.05, this.clock.getDelta()) / 5;
    for (let i = 0; i < 5; i++) {
      this._updateInvaders(deltaTime);
      this._updateProjectile(deltaTime);
      this._updateCollisions();
      this._playerUpdate();
      update();
    }
    if (this.spawnTime <= 0) {
      this.spawnTime = this.timer;
      this._spawnInvader();
    }
    this.spawnTime -= deltaTime;

    this.renderer.render(this.scene, this.camera);
  }

  public Destroy() {}
}

export default VR;
