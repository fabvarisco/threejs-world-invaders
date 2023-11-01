import {
  BufferGeometry,
  Camera,
  DirectionalLight,
  Group,
  HemisphereLight,
  Line,
  LineBasicMaterial,
  LineSegments,
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
} from "three";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { BoxLineGeometry } from "three/examples/jsm/geometries/BoxLineGeometry.js";

class VR {
  private readonly scene: Scene;
  private readonly camera: Camera;
  private renderer: WebGLRenderer;
  private controllers: Group[] = [];
  private intersection: any;
  private tempMatrix: Matrix4 = new Matrix4();
  private raycaster: Raycaster = new Raycaster();
  private readonly floor: Mesh;
  constructor(camera: Camera, renderer: WebGLRenderer) {
    this.scene = new Scene();
    this.camera = camera;
    this.renderer = renderer;

    this.scene.add(new HemisphereLight(0x606060, 0x404040));

    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    const room = new LineSegments(
      new BoxLineGeometry(6, 6, 6, 10, 10, 10).translate(0, 3, 0),
      new LineBasicMaterial({ color: 0xbcbcbc }),
    );
    this.scene.add(room);

    const floorGeometry = new PlaneGeometry(6, 6);
    const floorMaterial = new MeshStandardMaterial({ color: 0x666666 });
    this.floor = new Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
    this.buildControllers();
  }

  buildControllers(): void {
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
      controllers.push(controller);

      const grip = this.renderer.xr.getControllerGrip(i);
      grip.add(controllerModelFactory.createControllerModel(grip));
      controller.userData.grip = grip;
    }

    this.controllers = controllers;

    function onSelectStart(this: any, event: any): void {
      console.log(this);
      this.userData.selectPressed = true;
      console.log(this);
      console.log(event);
    }

    function onSelectEnd(this: any, event: any): void {
      this.userData.selectPressed = false;
      console.log(event);
      console.log(this);
      if (self.intersection) {
        const offsetPosition = {
          x: -self.intersection.x,
          y: -self.intersection.y,
          z: -self.intersection.z,
          w: 1,
        };
        const offsetRotation = new Quaternion();
        const transform = new XRRigidTransform(offsetPosition, offsetRotation);
        const teleportSpaceOffset = self.renderer.xr
          .getReferenceSpace()
          ?.getOffsetReferenceSpace(transform);

        console.log("aaaa " + teleportSpaceOffset);
        if (teleportSpaceOffset) {
          self.renderer.xr.setReferenceSpace(teleportSpaceOffset);
        }
      }
      console.log(self.intersection);
    }

    function onSqueezeStart(this: any, event: any): void {
      this.userData.squeezePressed = true;
      console.log(event);
    }

    function onSqueezeEnd(this: any, event: any): void {
      this.userData.squeezePressed = false;

      console.log(event);
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

  private createMarker(geometry: SphereGeometry, material: MeshBasicMaterial) {
    const mesh = new Mesh(geometry, material);
    mesh.visible = true;
    this.scene.add(mesh);
    return mesh;
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
    //this.intersection = undefined;
    this.controllers.forEach((controller: Group) => {
      if (controller.userData.selectPressed === true) {
        this.tempMatrix.identity().extractRotation(controller.matrixWorld);
        debugger;
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
      debugger;
      if (this.intersection)
        controller.userData.marker.position.copy(this.intersection);
    });
    this.renderer.render(this.scene, this.camera);
  }

  public Destroy() {}
}

export default VR;
