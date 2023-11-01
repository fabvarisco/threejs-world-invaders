import {
  BufferGeometry,
  CircleGeometry,
  Group,
  Line,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Raycaster,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

class VR {
  private scene: Scene;
  private renderer: WebGLRenderer;
  private controllers: Group[] = [];
  private teleports: Mesh[];
  private userData: any;
  private intersection: any;
  private tempMatrix: Matrix4 = new Matrix4();
  private raycaster: Raycaster = new Raycaster();
  private floor: Mesh = new Mesh();
  constructor(scene: Scene, renderer: WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;

    const locations = [
      new Vector3(-0.409, 0.086, 4.038),
      new Vector3(-0.846, 0.112, 5.777),
      new Vector3(5.22, 0.176, 2.677),
      new Vector3(1.49, 2.305, -1.599),
      new Vector3(7.565, 2.694, 0.008),
      new Vector3(-8.417, 2.676, 0.192),
      new Vector3(-6.644, 2.6, -4.114),
    ];

    const self = this;

    this.teleports = [];
    locations.forEach((location) => {
      const teleport = new Mesh(
        new CircleGeometry(0.25, 32).rotateX(-Math.PI / 2),
        new MeshBasicMaterial({ color: 0xbcbcbc }),
      );
      teleport.position.copy(location);
      self.scene.add(teleport);
      self.teleports.push(teleport);
    });

    this.loadEnvironment();
    this.buildControllers();
  }

  setEnvironment(): void {
    // Set environment logic here
  }

  loadEnvironment(): void {
    const floorGeometry = new PlaneGeometry(4, 4);
    const floorMaterial = new MeshStandardMaterial({ color: 0x666666 });
    this.floor = new Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
  }

  buildControllers(): void {
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
      controllers.push(controller);

      const grip = this.renderer.xr.getControllerGrip(i);
      grip.add(controllerModelFactory.createControllerModel(grip));
      controller.userData.grip = grip;
    }

    this.controllers = controllers;

    this.controllers.forEach((controller: Group): void => {
      controller.addEventListener("selectstart", this.onSelectStart);
      controller.addEventListener("selectend", this.onSelectEnd);
      controller.addEventListener("squeezestart", this.onSqueezeStart);
      controller.addEventListener("squeezeend", this.onSqueezeEnd);
      this.scene.add(controller.userData.grip);
      this.scene.add(controller);
    });
  }

  private createMarker(geometry: SphereGeometry, material: MeshBasicMaterial) {
    const mesh = new Mesh(geometry, material);
    mesh.visible = false;
    this.scene.add(mesh);
    return mesh;
  }
  onSelectStart(event: any): void {
    this.userData.selectPressed = true;

    console.log(event);
  }
  onSelectEnd(event: any): void {
    this.userData.selectPressed = false;
    console.log(event);
  }

  onSqueezeStart(event: any): void {
    this.userData.squeezePressed = true;
    console.log(event);
  }

  onSqueezeEnd(event: any): void {
    this.userData.squeezePressed = false;

    console.log(event);
  }

  // pickupGun(controller = this.controllers[0]) {
  //   this.gun.position.set(0, 0, 0);
  //   this.gun.quaternion.identity();
  //   //this.gun.rotateY( -Math.PI/2 )
  //   controller.children[0].visible = false;
  //   controller.add(this.gun);
  //   controller.userData.gun = true;
  //   const grip = controller.userData.grip;
  // }

  //@ts-ignore
  public Render(timestamp: any, frame: any) {
    this.intersection = undefined;

    this.controllers.forEach((controller) => {
      if (controller.userData.isSelecting === true) {
        this.tempMatrix.identity().extractRotation(controller.matrixWorld);

        this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        this.raycaster.ray.direction
          .set(0, 0, -1)
          .applyMatrix4(this.tempMatrix);

        const intersects = this.raycaster.intersectObjects([this.floor]);

        if (intersects.length > 0) {
          this.intersection = intersects[0].point;
        }
      }
      controller.userData.marker.visible = this.intersection !== undefined;
      if (this.intersection)
        controller.userData.marker.position.copy(this.intersection);
    });
  }

  public Destroy() {}
}

export default VR;
