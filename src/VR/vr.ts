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
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

class VR {
  private readonly scene: Scene;
  private readonly camera: Camera;
  private renderer: WebGLRenderer;
  private controllers: Group[] = [];
  private intersection: any;
  private tempMatrix: Matrix4 = new Matrix4();
  private raycaster: Raycaster = new Raycaster();
  private readonly floor: Mesh;
  private projectiles: { mesh: Mesh, velocity: Vector3 }[] = [];
  private baseReferenceSpace: XRReferenceSpace | null | undefined;
  private gun: Group = new Group();
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
    this.floor.name = "floor"
    this.scene.add(this.floor);

    this.renderer.xr.addEventListener(
      "sessionstart",
      this.onSessionStart.bind(this),
    );

    this.buildControllers();
    this.createGun();

    this.renderer.setAnimationLoop(this.Render.bind(this));
  }

  private onSessionStart(): void {
    this.baseReferenceSpace = this.renderer.xr.getReferenceSpace();
    console.log("base " + this.baseReferenceSpace);
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
      controller.userData.hasGun = false;
      controllers.push(controller);

      const grip = this.renderer.xr.getControllerGrip(i);
      grip.add(controllerModelFactory.createControllerModel(grip));
      controller.userData.grip = grip;
    }

    this.controllers = controllers;


    //@ts-ignore
    function onSelectStart(this: any, event: any): void {
      this.userData.selectPressed = true;
    }

    //@ts-ignore
    function onSelectEnd(this: any, event: any): void {
      this.userData.selectPressed = false;
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
  private shoot(): void {
 // Loop through controllers to find the one with the gun
 const controllerWithGun = this.controllers.find(controller => controller.userData.hasGun);

 if (controllerWithGun) {
   // Get the gun from the controller
   const gun = controllerWithGun.userData.grip;

   // Create a projectile mesh
   const projectileGeometry = new SphereGeometry(0.05, 8, 6);
   const projectileMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
   const projectile = new Mesh(projectileGeometry, projectileMaterial);

   // Set the projectile position and velocity based on gun direction
   const gunDirection = new Vector3(0,0,1);
   const gunPosition = new Vector3();
   
   // Get the gun position and direction in world coordinates
   gun.getWorldPosition(gunPosition);
   gun.getWorldDirection(gunDirection);

   // Set the projectile position at the tip of the gun
   const projectileStartPosition = gunPosition.clone().add(gunDirection.clone().multiplyScalar(0.1));

   projectile.position.copy(projectileStartPosition);

   // Set the velocity based on the gun direction
   const projectileVelocity = gunDirection.clone().multiplyScalar(0.1); // Adjust the speed as needed

   // Add the projectile to the scene
   this.scene.add(projectile);

   // Store the projectile and its velocity for later updates
   this.projectiles.push({ mesh: projectile, velocity: projectileVelocity });
 }
  }

  private updateProjectile() {
    this.projectiles.forEach(el => el.mesh.position.add(el.velocity))
  }

  private createGun() {
    const loader = new FBXLoader();
    const self = this;
    loader.loadAsync("/models/Earth.fbx").then(gun => {
      gun.scale.set(0.0001, 0.0001, 0.0001);
      gun.rotation.set(0, Math.PI, 0);
      gun.position.set(-0.50, 1.50, -1.00);
      gun.children[1].name = "gun";
      self.gun = gun;
      self.scene.add(gun);

      // self.controllers.forEach((controller: Group): void => {
      //   controller.addEventListener('squeezestart', function () {
      //     controller.attach(gun);
      //     self.gunAttached = true
      //   });
      //   controller.addEventListener('squeezeend', function () {
      //     self.scene.attach(gun);
      //     self.gunAttached = false
      //   });
      //   controller.addEventListener('selectstart', function () {
      //     if (self.gunAttached) {
      //       self.shoot(gun.getWorldPosition(new Vector3()), gun.getWorldDirection(new Vector3()));

      //     }
      //   })

      //   console.log(gun)
      //   debugger;
      // });
      self.controllers.forEach((controller: Group): void => {
        controller.addEventListener('squeezeend', function () {
          self.scene.attach(gun);
          controller.userData.hasGun = false
        });
        controller.addEventListener('selectend', function () {
          if (controller.userData.hasGun) {
            self.shoot();
          }
        })
      });


    }).catch(err => console.log("asasa " + err));
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
  public Render(timestamp: any, frame: any): void {

    this.intersection = undefined;
    this.controllers.forEach((controller: Group) => {
      this.tempMatrix.identity().extractRotation(controller.matrixWorld);
      this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      this.raycaster.ray.direction
        .set(0, 0, -1)
        .applyMatrix4(this.tempMatrix);

      const intersects = this.raycaster.intersectObjects([this.floor, this.gun]);
      if (intersects.length > 0) {
        this.intersection = intersects[0];
      }
      if (controller.userData.selectPressed === true && this.intersection) {
        if (this.intersection.object.name === "floor") {

        }
        if (this.intersection.object.name === "gun") {
          this.gun.position.set(0, 0, 0);
          this.gun.quaternion.identity();
          this.gun.rotateY( Math.PI )
          controller.add(this.gun);
          controller.userData.hasGun = true;
          controller.userData.grip = this.gun;
        }
      }

      controller.userData.marker.visible = this.intersection !== undefined;
      if (this.intersection && !controller.userData.hasGun) {
        controller.userData.marker.position.copy(this.intersection?.point);
      }
    });
    this.updateProjectile();
    this.renderer.render(this.scene, this.camera);
  }

  public Destroy() { }
}

export default VR;
