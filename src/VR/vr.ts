import {
  BufferGeometry,
  Group,
  Line,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { XRHandModelFactory } from "three/examples/jsm/webxr/XRHandModelFactory.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

class VR {
  private scene: Scene;
  private renderer: WebGLRenderer;
  private controller1: Group | undefined;
  private controller2: Group | undefined;
  private scaling: any;
  constructor(scene: Scene, renderer: WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.scaling = {
      active: false,
      initialDistance: 0,
      object: null,
      initialScale: 1,
    };

    this.loadEnvironment();
    this.buildControllers();
  }

  setEnvironment() {
    // Set environment logic here
  }

  loadEnvironment() {
    const floorGeometry = new PlaneGeometry(4, 4);
    const floorMaterial = new MeshStandardMaterial({ color: 0x666666 });
    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  buildControllers(): void {
    // controllers

    this.controller1 = this.renderer.xr.getController(0);
    this.scene.add(this.controller1);

    this.controller2 = this.renderer.xr.getController(1);
    this.scene.add(this.controller2);

    const controllerModelFactory = new XRControllerModelFactory();
    const handModelFactory = new XRHandModelFactory();

    // Hand 1
    const controllerGrip1 = this.renderer.xr.getControllerGrip(0);
    controllerGrip1.add(
      controllerModelFactory.createControllerModel(controllerGrip1),
    );
    this.scene.add(controllerGrip1);

    const hand1 = this.renderer.xr.getHand(0);
    hand1.addEventListener("pinchstart", this.onPinchStartLeft);
    hand1.addEventListener("pinchend", () => {
      this.scaling.active = false;
    });
    hand1.add(handModelFactory.createHandModel(hand1));

    this.scene.add(hand1);

    // Hand 2
    const controllerGrip2 = this.renderer.xr.getControllerGrip(1);
    controllerGrip2.add(
      controllerModelFactory.createControllerModel(controllerGrip2),
    );
    this.scene.add(controllerGrip2);

    const hand2 = this.renderer.xr.getHand(1);
    hand2.addEventListener("pinchstart", this.onPinchStartRight);
    hand2.addEventListener("pinchend", this.onPinchEndRight);
    hand2.add(handModelFactory.createHandModel(hand2));
    this.scene.add(hand2);

    //

    const geometry = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, 0),
      new Vector3(0, 0, -1),
    ]);

    const line = new Line(geometry);
    line.name = "line";
    line.scale.z = 5;

    this.controller1.add(line.clone());
    this.controller2.add(line.clone());

    //
  }

  onPinchStartLeft(event: any): void {
    console.log(event);
  }
  onPinchStartRight(event: any): void {
    console.log(event);
  }

  onPinchEndRight(event: any): void {
    console.log(event);
  }

  public Render() {
    // Render logic here
  }
}

export default VR;
