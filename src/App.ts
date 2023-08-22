import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
//@ts-ignore
import { CanvasUI } from '../libs/CanvasUI';

class App {
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private geometry: THREE.BufferGeometry;
  private meshes: THREE.Mesh[];
  private ui: any; //CanvasUI

  constructor() {

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    this.scene = new THREE.Scene();

    this.scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('app') as HTMLCanvasElement,
      antialias: true, alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);


    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 3.5, 0);
    this.controls.update();


    this.geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    this.meshes = [];

    this.ui = this.createUI();

    window.addEventListener('resize', this.resize.bind(this));
  }

  public Start() {
    this.setupXRCreateCube();
  }

  private createUI() {

    const config = {
      panelSize: { width: 0.6, height: 0.3 },
      width: 512,
      height: 256,
      opacity: 0.7,
      body: {
        fontFamily: 'Arial',
        fontSize: 20,
        padding: 20,
        backgroundColor: '#000',
        fontColor: '#fff',
        borderRadius: 6,
        opacity: 0.7
      },
      info: {
        type: "text",
        position: { x: 0, y: 0 },
        height: 128
      },
      msg: {
        type: "text",
        position: { x: 0, y: 128 },
        fontSize: 30,
        height: 128
      }
    }
    const content = {
      info: "info",
      msg: "controller"
    }

    const ui = new CanvasUI(content, config);
    ui.mesh.material.opacity = 0.7;

    return ui;
  }


  private setupXRCreateCube() {
    this.renderer.xr.enabled = true;

    const self = this;
    let controller: THREE.Group;

    function onSelect() {
      const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
      const mesh = new THREE.Mesh(self.geometry, material);
      mesh.position.set(0, 0, -0.3).applyMatrix4(controller.matrixWorld);
      mesh.quaternion.setFromRotationMatrix(controller.matrixWorld);
      self.scene.add(mesh);
      self.meshes.push(mesh);
    }

    document.body.appendChild(ARButton.createButton(this.renderer))

    controller = this.renderer.xr.getController(0) as THREE.Group;
    controller.addEventListener('select', onSelect);
    this.scene.add(controller);

    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  // private setupXRWithCanvasUI() {
  //   this.renderer.xr.enabled = true;

  //   const self = this;

  //   function onConnected(event) {
  //     if (self.info === undefined) {
  //       const info = {};

  //       fetchProfile(event.data, DEFAULT_PROFILES_PATH, DEFAULT_PROFILE).then(({ profile, assetPath }) => {
  //         console.log(JSON.stringify(profile));

  //         info.name = profile.profileId;
  //         info.targetRayMode = event.data.targetRayMode;

  //         Object.entries(profile.layouts).forEach(([key, layout]) => {
  //           const components = {};
  //           Object.values(layout.components).forEach((component) => {
  //             components[component.type] = component.gamepadIndices;
  //           });
  //           info[key] = components;
  //         });

  //         self.info = info;
  //         self.ui.updateElement("info", JSON.stringify(info));

  //       });
  //     }
  //   }

  //   function onSessionStart() {
  //     self.ui.mesh.position.set(0, -0.5, -1.1);
  //     self.camera.add(self.ui.mesh);
  //   }

  //   function onSessionEnd() {
  //     self.camera.remove(self.ui.mesh);
  //   }
  //   const btn = ARButton.createButton(this.renderer, { optionalFeatures: ['dom-overlay'], domOverlay: { root: document.body } })
    
  //   btn.addEventListener('selectstart',onSessionStart)
  //   btn.addEventListener('selectstart',onSessionStart)
  //   document.body.appendChild(btn)


  //   const controller = this.renderer.xr.getController(0);
  //   controller.addEventListener('connected', onConnected);

  //   this.scene.add(controller);
  //   this.controller = controller;

  //   this.renderer.setAnimationLoop(this.render.bind(this));
  // }

  private resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private render() {
    this.meshes.forEach((mesh) => {
      mesh.rotateY(0.01);
    });
    this.renderer.render(this.scene, this.camera);
  }
}

export { App } 
