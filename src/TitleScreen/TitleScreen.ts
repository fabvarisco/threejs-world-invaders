import {
  DirectionalLight,
  Event,
  HemisphereLight,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import Text from "@/Assets/Text.ts";

class TitleScreen {
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private earth: Object3D<Event> = new Object3D<Event>();
  private invader: any;
  private invaders: any[] = [];
  private spawnTime: number = 2000;
  private timer: number = 2000;
  private lastFrameTimestamp: number = 0;
  private titleText: Text;

  constructor(camera: PerspectiveCamera, renderer: WebGLRenderer) {
    this.scene = new Scene();
    this.camera = camera;
    this.renderer = renderer;
    this.scene.add(new HemisphereLight(0x606060, 0x404040));

    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.screenSpacePanning = false;
    this.controls.autoRotate = false;
    this.controls.enableZoom = false;
    this.controls.enabled = false
    this.controls.minDistance = 40
    this.loadTitleScreen();

    this.titleText = new Text(
        "./fonts/Pixel.json",
        "World",
        this.scene,
        new Vector3(0, 4, 30),
    );
    this.titleText = new Text(
        "./fonts/Pixel.json",
        "Invaders",
        this.scene,
        new Vector3(0, 3, 30),
    );
    this.titleText.GetTextMesh().updateMatrixWorld();

    this.renderer.setAnimationLoop(this.Render.bind(this));
  }

  private loadTitleScreen() {
    const fbxLoader = new FBXLoader();
    const gltfLoader = new GLTFLoader();
    const self = this;
    fbxLoader.loadAsync("/models/earth.fbx").then((earth: Object3D<Event>) => {
        earth.scale.set(0.01, 0.01, 0.01);
        self.earth = earth;
        self.scene.add(earth);
      }).catch((err: string) => console.log(err));

    gltfLoader.loadAsync("/models/invader.glb").then((gltf) => {
      gltf.scene.scale.set(4, 4, 4);
      self.invader = gltf.scene.clone();
    }).catch((err: string) => console.log(err));
    }


  private spawnInvader(): void {
    const minX = -40;
    const maxX = 40;
    const minY = 0;
    const maxY = 40;
    const minZ = -40;
    const maxZ = 40;

    const position: Vector3 = new Vector3(0, 0, 0);
    position.x = Math.random() * (maxX - minX) + minX;
    position.y = Math.random() * (maxY - minY) + minY;
    position.z = Math.random() * (maxZ - minZ) + minZ;
    const newInvader = this.invader.clone();
    newInvader.position.set(position.x,position.y,position.z);
    
    this.invaders.push(newInvader);
    this.scene.add(newInvader);
  }

  private updateInvaders() {
    if(!this.invader) return;
    this.invaders.forEach(el =>{
      const speed = 0.05;

      const direction = new Vector3();
      direction.subVectors(this.earth!.position, el.position);
      direction.normalize();
      el.position.addScaledVector(direction, speed);

      el.position.add(new Vector3(0,0,0));
      el.lookAt(this.earth?.position)
      const distance = this.earth!.position.distanceTo(el.position);
      if (distance <= 5.0) {
        this.scene.remove(el);
      }
    })
  }

  private updateEarth(deltaTime:number){
    if(!this.earth) return
    this.earth.rotation.y += 0.0001 * deltaTime; // Rotate around the y-axis
  }

  //@ts-ignore
  Render(timestamp: any, frame: any) {
    const deltaTime = timestamp - this.lastFrameTimestamp;
    this.lastFrameTimestamp = timestamp;

    if(this.spawnTime <= 0) {
      this.spawnTime = this.timer;
      this.spawnInvader();
    }

    this.controls.update();
    this.updateInvaders();
    this.updateEarth(deltaTime);
    this.renderer.render(this.scene, this.camera);

    this.spawnTime -= deltaTime;

  }

  Destroy() {
    this.controls.dispose();
    this.renderer.setAnimationLoop(null);
  }
}

export default TitleScreen;
