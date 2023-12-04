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
  Object3D,
} from "three";
import GameObject from "../assets/gameObjects/GameObject";
import Overlay from "../assets/Overlay";
import InvaderGameObject from "../assets/gameObjects/InvaderGameObject";
import { Block, Text, update } from "three-mesh-ui";

class AR {
  private readonly camera: Camera;
  private readonly renderer: WebGLRenderer;
  private clock: Clock;
  private invaders: InvaderGameObject[] = [];
  private spheres: GameObject[] = [];
  private scene: Scene = new Scene();
  private spawnTime: number = 1;
  private timer: number = 1;
  private controllers: Group[] = [];
  private xrSession: XRSession | null = null;
  private stepsPerFrame: number = 5;
  private prefabs: Map<string, Object3D>;
  private overlay: Overlay = new Overlay();
  private textContainer: Block;
  constructor(
    camera: Camera,
    renderer: WebGLRenderer,
    prefabs: Map<string, Object3D>
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
    this.overlay.update();

    // Create VR GUI
    this.textContainer = new Block({
      width: 0.3,
      height: 0.3,
      padding: 0.05,
      justifyContent: "center",
      textAlign: "center",
      fontFamily: './fonts/Roboto-msdf.json',
      fontTexture: './fonts/Roboto-msdf.png',
    });

    //
    this.textContainer.position.set(0, 0, -1.8);
    const text = new Text({
      content: "Life: 3"
    });

    this.textContainer.add(text);

    this.scene.add(this.textContainer);

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

    const sphere = new GameObject(
      meshSphere,
      this.controllers[0].position,
      0.6,
      this.scene
    );
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

  private _playerUpdate() {
    for (let i = 0; i < this.invaders.length; i++) {
      const invader = this.invaders[i];
      if (invader.GetModel().position.distanceTo(this.camera.position) <= 1) {
        invader.Destroy();
      }
    }
  }

  private _invadersCollisions(): void {
    for (let i = 0; i < this.spheres.length; i++) {
      for (let j = 0; j < this.invaders.length; j++) {
        const sphere = this.spheres[i];
        const invader = this.invaders[j];

        if (invader.IntersectBoxWith(sphere)) {
          this.spheres.splice(i, 1);
          this.invaders.splice(j, 1);

          invader.Destroy();
          sphere.Destroy();
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
    const invaderModel: Object3D = this.prefabs.get("invader")!.clone();

    const position: Vector3 = new Vector3(0, 0, 0);
    position.x = Math.random() * (maxX - minX) + minX;
    position.y = Math.random() * (maxY - minY) + minY;
    position.z = Math.random() * (maxZ - minZ) + minZ;

    const newInvader = new InvaderGameObject(
      invaderModel,
      position,
      6,
      this.scene
    );
    newInvader.GetModel().scale.set(1, 1, 1);
    this.invaders.push(newInvader);
    this.scene.add(newInvader.GetModel());
    console.log("asddasasd");
  }

  private _updateInvaders(_deltaTime: number) {
    this.invaders.forEach((el, index, object) => {
      if (el.IsRemoved()) {
        object.splice(index, 1);
      }
      el.Update(this.camera.position, _deltaTime);
    });
  }

  private _endSession() {
    location.reload();
  }

  private _animate() {
    const deltaTime =
      Math.min(0.05, this.clock.getDelta()) / this.stepsPerFrame;

    for (let i = 0; i < this.stepsPerFrame; i++) {
      this._updateInvaders(deltaTime);
      this._updateSpheres(deltaTime);
      this._playerUpdate();


      const distance = 1; 
      const angle = -Math.PI / 4; 
      const cameraDirection = new Vector3();
      this.camera.getWorldDirection(cameraDirection); 
      const targetPosition = new Vector3().copy(this.camera.position).add(cameraDirection.multiplyScalar(distance)); 
      targetPosition.x -= .2
      targetPosition.y -= .4


      this.textContainer.position.copy(targetPosition);

      this.textContainer.rotation.setFromRotationMatrix(this.camera.matrix);

      update();
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
    this.renderer.render(this.scene, this.camera);
  }

  public Destroy() { }
}

export default AR;
