import GameObject from "@/Assets/GameObjects/GameObject";
import Prefab from "@/Assets/Prefabs/Prefab";
import {
  Camera,
  Clock,
  DirectionalLight,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshLambertMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";

class AR {
  private readonly camera: Camera;
  private readonly renderer: WebGLRenderer;
  private clock: Clock;
  private invaders: GameObject[] = [];
  private spheres: GameObject[] = [];
  private scene: Scene = new Scene();
  private spawnTime: number = 1;
  private timer: number = 1;
  private controllers: Group[] = [];
  private xrSession: XRSession | null = null;
  private stepsPerFrame: number = 5;
  private prefabs: Map<string, Prefab>;
  constructor(
    camera: Camera,
    renderer: WebGLRenderer,
    prefabs: Map<string, Prefab>
  ) {
    this.camera = camera;
    this.renderer = renderer;
    this.clock = new Clock();
    this.prefabs = prefabs;

    this.scene.add(new HemisphereLight(0x606060, 0x404040));

    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    this._buildControllers();
    this.renderer.setAnimationLoop(this._animate.bind(this));
  }

  private _onSelect(): void {
    const sphereGeometry = new IcosahedronGeometry(0.02, 5);
    const sphereMaterial = new MeshLambertMaterial({ color: 0xdede8d });
    const meshSphere = new Mesh(sphereGeometry, sphereMaterial);
    meshSphere.castShadow = true;
    meshSphere.receiveShadow = true;

    const velocity = new Vector3(0, 0, -0.1);
    velocity.x = (Math.random() - 0.5) * 0.02;
    velocity.y = (Math.random() - 0.5) * 0.02;
    velocity.z = Math.random() * 0.01 - 0.05;
    velocity.applyQuaternion(this.controllers[0].quaternion);

    const sphere = new GameObject(meshSphere, this.controllers[0].position);
    sphere.SetVelocity(velocity.clone().multiplyScalar(23));

    this.spheres.push(sphere);
    this.scene.add(sphere.GetModel());
  }

  private _updateSpheres(deltaTime: number) {
    for (const sphere of this.spheres) {
      sphere.AddScalar(deltaTime);
      const distance = this.camera.position.distanceTo(
        sphere.GetModel().position
      );
      if (distance >= 5.0) {
        this.scene.remove(sphere.GetModel());
      }
    }
    this._invadersCollisions();
  }

  private _invadersCollisions(): void {
    for (let i = 0; i < this.spheres.length; i++) {
      for (let j = 0; j < this.invaders.length; j++) {
        const sphere = this.spheres[i];
        const invader = this.invaders[j];

        if (invader.IntersectBoxWith(sphere)) {
          this.scene.remove(sphere.GetModel());
          this.spheres.splice(i, 1);

          this.scene.remove(invader.GetModel());
          this.invaders.splice(j, 1);

          i--;
          j--;
        }
      }
    }
  }

  private _buildControllers(): void {
    for (let i = 0; i <= 1; i++) {
      const controller = this.renderer.xr.getController(i);
      controller.userData.position = controller.position;
      controller.addEventListener("select", this._onSelect.bind(this));
      controller.userData.index = i;
      this.controllers.push(controller);
      this.scene.add(controller);
    }
  }

  private _spawnInvaders(): void {
    const minX = -60;
    const maxX = 60;
    const minY = 0;
    const maxY = 60;
    const minZ = -60;
    const maxZ = 60;
    const invaderModel: Group = this.prefabs
      .get("invader")
      ?.GetObject()
      .clone() as Group;

    const position: Vector3 = new Vector3(0, 0, 0);
    position.x = Math.random() * (maxX - minX) + minX;
    position.y = Math.random() * (maxY - minY) + minY;
    position.z = Math.random() * (maxZ - minZ) + minZ;

    const newInvader = new GameObject(invaderModel, position);
    newInvader.GetModel().scale.set(0.8, 0.8, 0.8);
    this.invaders.push(newInvader);
    this.scene.add(newInvader.GetModel());
  }

  private _updateInvaders() {
    this.invaders.forEach((el) => {
      el.MoveTo(this.camera.position);
      el.LookTo(this.camera.position);
    });
  }

  private _endSession() {
    location.reload();
  }

  private _animate() {
    const deltaTime =
      Math.min(0.05, this.clock.getDelta()) / this.stepsPerFrame;

    for (let i = 0; i < this.stepsPerFrame; i++) {
      this._updateInvaders();
      this._updateSpheres(deltaTime);
    }

    if (!this.xrSession) {
      const session = this.renderer.xr.getSession();
      session
        ?.requestReferenceSpace("viewer")
        .then(() => {
          this.xrSession = session;
          this.xrSession.addEventListener("end", this._endSession.bind(this));
        })
        .catch((error) => {
          console.error("Failed to create XR session: ", error);
        });
    }

    if (this.spawnTime <= 0) {
      this.spawnTime = this.timer;
      this._spawnInvaders();
    }

    this.spawnTime -= deltaTime;
    console.log(this.spawnTime);
    this.renderer.render(this.scene, this.camera);
  }

  public Destroy() {}
}

export default AR;
