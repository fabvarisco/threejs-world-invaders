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


    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 2, 5);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))

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


    this.reticle = new THREE.Mesh(new THREE.RingGeometry(0.15, .2, 32).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial());
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);

    window.addEventListener('resize', this.resize.bind(this));
  }


  private createInsideBox(): THREE.Object3D {
    const geo = new THREE.BoxGeometry(1, 1, 1)
    const mat = new THREE.MeshLambertMaterial({
      color: 0xff0000,
    })
    const insideMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      side: THREE.BackSide,
    })
    const box = new THREE.Mesh(geo, mat)
    box.scale.setScalar(0.2)
    box.rotation.x = Math.PI / 4
    box.rotation.y = Math.PI / 4
    const innerBox = new THREE.Mesh(geo, insideMat)
    const insideBox = new THREE.Object3D()
    insideBox.add(innerBox)
    return insideBox
  }


  private createOutsideBox(): THREE.Object3D {
    const outsidePlaneGeo = new THREE.PlaneGeometry(1, 1, 1, 1)
    const planeOptionArr = [
      {// Right
        rotateY: Math.PI / 2,
        rotateX: 0,
        translate: [0.5, 0, 0]
      },
      {// Left
        rotateY: -Math.PI / 2,
        rotateX: 0,
        translate: [-0.5, 0, 0]
      },
      {// Top
        rotateY: 0,
        rotateX: -Math.PI / 2,
        translate: [0, 0.5, 0]
      },
      {// Bottom
        rotateY: 0,
        rotateX: Math.PI / 2,
        translate: [0, -0.5, 0]
      },
      {// Back
        rotateY: 0,
        rotateX: Math.PI,
        translate: [0, 0, -0.5]
      },
    ]
    const outsideMat = new THREE.MeshBasicMaterial({
      colorWrite: false,
    })
    const outsideBox = new THREE.Object3D()
    planeOptionArr.forEach((opt) => {
      const { rotateY, rotateX, translate } = opt
      const geo = outsidePlaneGeo.clone().rotateY(rotateY).rotateX(rotateX).translate(translate[0], translate[1], translate[3]);
      const mesh = new THREE.Mesh(geo, outsideMat)
      outsideBox.add(mesh)
    })
    return outsideBox
  }



  public Start() {
    this.renderer.xr.enabled = true;

    const geometry = new THREE.BoxGeometry(.3, .3, .3);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff * Math.random() });
    const planeGeo = new THREE.PlaneGeometry( 50, 50 );
    const self = this;

    // const insideBox = this.createInsideBox()
    // insideBox.scale.setScalar(300 * 0.99)

    // const outsideBox = this.createOutsideBox()
    // outsideBox.scale.setScalar(100)


    // this.scene.add(insideBox)
    // this.scene.add(outsideBox)





    function onSelect() {
      if (self.reticle.visible) {
        // const cube = new THREE.Mesh(geometry, material);
        // cube.position.setFromMatrixPosition(self.reticle.matrix);
        // cube.name = "cube"
        // self.scene.add(cube)
        // const outsideBox = self.createOutsideBox()
        // outsideBox.scale.setScalar(100)
        // self.scene.add(outsideBox)
        const leftPortalTexture = new THREE.WebGLRenderTarget( 256, 256 );
        const leftPortal = new THREE.Mesh( planeGeo, new THREE.MeshBasicMaterial( { map: leftPortalTexture.texture } ) );
    
        leftPortal.scale.set( 5, 5, 5 );
        self.scene.add( leftPortal );
    
        const rightPortalTexture = new THREE.WebGLRenderTarget( 256, 256 );
        const rightPortal = new THREE.Mesh( planeGeo, new THREE.MeshBasicMaterial( { map: rightPortalTexture.texture } ) );
    
        rightPortal.scale.set( 1, 1, 1 );
        rightPortal.position.setFromMatrixPosition(self.reticle.matrix);
        self.scene.add( rightPortal );

        
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
      const session = this.renderer.xr.getSession();

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
    this.scene.children.forEach(object => {
      if (object.name === "cube") {
        object.rotation.y += 0.01
      }
    })
    this.renderer.render(this.scene, this.camera);
  }
}
export default App 
