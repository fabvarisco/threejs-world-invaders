import {
  Box3,
  BoxGeometry,
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
import {DEVICE_POSITION} from "@/utils/utils.ts";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


class VR {
  private readonly scene: Scene;
  private readonly camera: Camera;
  private renderer: WebGLRenderer;
  private controllers: Group[] = [];
  private intersection: any;
  private tempMatrix: Matrix4 = new Matrix4();
  private raycaster: Raycaster = new Raycaster();
  private readonly floor: Mesh;
  private projectiles: { mesh: Mesh, velocity: Vector3,box: Box3 }[] = [];
  private monsters:{ mesh: Mesh, velocity: Vector3, box: Box3 }[] = [];
  private spawnTime: number = 1000;
  private timer: number = 1000;
  private lastFrameTimestamp: number = 0;

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
 const controllerWithGun = this.controllers.find(controller => controller.userData.hasGun);

   if (controllerWithGun) {
     const gun = controllerWithGun.userData.grip;

     const projectileGeometry = new SphereGeometry(0.05, 8, 6);
     const projectileMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
     const projectile = new Mesh(projectileGeometry, projectileMaterial);

     const gunDirection = new Vector3(0,0,1);
     const gunPosition = new Vector3();

     gun.getWorldPosition(gunPosition);
     gun.getWorldDirection(gunDirection);

     const projectileStartPosition = gunPosition.clone().add(gunDirection.clone().multiplyScalar(0.1));

     projectile.position.copy(projectileStartPosition);

     const projectileVelocity = gunDirection.clone().multiplyScalar(0.1); // Adjust the speed as needed

     this.scene.add(projectile);

      this.projectiles.push({ mesh: projectile, velocity: projectileVelocity, box: new Box3().setFromObject(projectile) });
   }
  }

  private updateProjectile() {
    this.projectiles.forEach(el => {
      el.mesh.position.add(el.velocity)
        el.box.setFromObject(el.mesh);
    })
  }

  private updateCollisions(): void {
    for (let i = 0; i < this.projectiles.length; i++) {
      for (let j = 0; j < this.monsters.length; j++) {
        const projectile = this.projectiles[i];
        const monster = this.monsters[j];
  
        if (this.checkCollision(projectile, monster)) {
          this.handleCollision(projectile, monster);
  
          this.scene.remove(projectile.mesh);
          this.projectiles.splice(i, 1);
  
          this.scene.remove(monster.mesh);
          this.monsters.splice(j, 1);
  
          i--;
          j--;
        }
      }
    }
  }
  
  private checkCollision(projectile: any, monster: any): boolean {
    return projectile.box.intersectsBox(monster.box);
  }
  
  private handleCollision(projectile: any, monster: any): void {
    console.log("Collision detected!" + projectile + monster);
  }
  
  private updateMonsters() {
    this.monsters.forEach(el =>{
      const speed = 0.01;

      const direction = new Vector3();
      direction.subVectors(DEVICE_POSITION, el.mesh.position);
      direction.normalize();
      el.mesh.position.addScaledVector(direction, speed);

      el.mesh.position.add(el.velocity);
      el.box.setFromObject(el.mesh)
      const distance = DEVICE_POSITION.distanceTo(el.mesh.position);
      if (distance <= 1.0) {
       }
    })
  }

  private createGun() {
    const gltfLoader = new GLTFLoader();

    const self = this;

    gltfLoader
      .loadAsync("/models/blasterB.glb")
      .then((gltf) => {
        gltf.scene.rotation.set(0, Math.PI, 0);
        gltf.scene.position.set(-0.50, 1.50, -1.00);
        console.log(gltf.scene)
        gltf.scene.children[0].children[0].name = "gun";
        console.log(gltf.scene.children[0].children[0])

        self.gun = gltf.scene;
        self.scene.add(self.gun);
  
        self.controllers.forEach((controller: Group): void => {
          controller.addEventListener('squeezeend', function () {
            self.scene.attach(self.gun);
            controller.userData.hasGun = false
          });
          controller.addEventListener('selectstart', function () {
            if (controller.userData.hasGun) {
              self.shoot();
            }
          })
      })
    })
      .catch((err: string) => console.log(err));
  }

  private spawnMonster():void {
    const minX = -10;
    const maxX = 10;
    const minY = -10;
    const maxY = 10;
    const minZ = -10;
    const maxZ = 10;

    const position: Vector3 = new Vector3(0, 0, 0);
    position.x = Math.random() * (maxX - minX) + minX;
    position.y = Math.random() * (maxY - minY) + minY;
    position.z = Math.random() * (maxZ - minZ) + minZ;


    const monsterGeometry = new BoxGeometry(0.3, 0.3, 0.3);
    const monsterMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
    const monsterMesh = new Mesh(monsterGeometry, monsterMaterial);
    const monster = {
      mesh: monsterMesh,
      velocity: new Vector3(0,0,0),
      box: new Box3().setFromObject(monsterMesh)};
    monster.mesh.position.set(position.x,position.y,position.y);
    this.monsters.push(monster);

    this.scene.add(monster.mesh);
  }


  private createMarker(geometry: SphereGeometry, material: MeshBasicMaterial) {
    const mesh = new Mesh(geometry, material);
    mesh.visible = true;
    this.scene.add(mesh);
    return mesh;
  }

  //@ts-ignore
  public Render(timestamp: any, frame: any): void {
    const deltaTime = timestamp - this.lastFrameTimestamp;
    this.lastFrameTimestamp = timestamp;

    if(this.spawnTime <= 0) {
      this.spawnTime = this.timer;
      this.spawnMonster();
    }

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
    DEVICE_POSITION.set(
        this.controllers[0].position.x,
        this.controllers[0].position.y,
        this.controllers[0].position.z,
    );
    this.spawnTime -= deltaTime;
    this.updateProjectile();
    this.updateMonsters();
    this.updateCollisions();
    this.renderer.render(this.scene, this.camera);
  }

  public Destroy() { }
}

export default VR;
