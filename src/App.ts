import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';


class App {
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private reticle: THREE.Mesh;
  private hitTestSource: any;
  private hitTestSourceRequested: boolean;
  constructor() {
    this.hitTestSource = undefined;
    this.hitTestSourceRequested = false;


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


    this.reticle = new THREE.Mesh(new THREE.RingGeometry(0.15, .2, 32), new THREE.MeshStandardMaterial()).rotateY(-Math.PI / 2);
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = true;
    this.scene.add(this.reticle);

    window.addEventListener('resize', this.resize.bind(this));
  }

  public Start() {
    this.renderer.xr.enabled = true;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff * Math.random() });

    const self = this;

    function onSelect() {
      if (self.reticle.visible) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.setFromMatrixPosition(self.reticle.matrix);
        cube.name = "cube"
        self.scene.add(cube)
      }
    }



    document.body.appendChild(ARButton.createButton(this.renderer, { requiredFeatures: ['hit-test'] }))

    const controller: THREE.Group = this.renderer.xr.getController(0) as THREE.Group;
    controller.addEventListener('select', onSelect);

    this.scene.add(controller);

    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  private resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  //@ts-ignore
  private render(timestamp: any, frame: any) {
    if (frame) {
      const referenceSpace = this.renderer.xr.getReferenceSpace();
      const session: XRSession | null = this.renderer.xr.getSession();

      if (this.hitTestSourceRequested === false) {
        session?.requestReferenceSpace('viewer').then(referenceSpace => {
          //@ts-ignore
          session?.requestHitTestSource({ space: referenceSpace })?.then(source =>
            this.hitTestSource = source)
        })

        this.hitTestSourceRequested = true;

        session?.addEventListener("end", () => {
          this.hitTestSourceRequested = false;
          this.hitTestSource = null;
        })
      }

      if (this.hitTestSource) {
        const hitTestResults = frame.getHitTestResults(this.hitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          this.reticle.visible = true;
          this.reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix)

        } else {
          this.reticle.visible = false

        }
      }
    }
    // console.log(scene.children)
    this.scene.children.forEach(object => {
      if (object.name === "cube") {
        object.rotation.y += 0.01
      }
    })


    this.renderer.render(this.scene, this.camera);
  }


}
export { App } 
