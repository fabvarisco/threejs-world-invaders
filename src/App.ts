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


  // private createInsideBox(): THREE.Object3D {
  //   const geo = new THREE.BoxGeometry(1, 1, 1)
  //   const mat = new THREE.MeshLambertMaterial({
  //     color: 0xff0000,
  //   })
  //   const insideMat = new THREE.MeshLambertMaterial({
  //     color: 0xffffff,
  //     side: THREE.BackSide,
  //   })
  //   const box = new THREE.Mesh(geo, mat)
  //   box.scale.setScalar(0.2)
  //   box.rotation.x = Math.PI / 4
  //   box.rotation.y = Math.PI / 4
  //   const innerBox = new THREE.Mesh(geo, insideMat)
  //   const insideBox = new THREE.Object3D()
  //   insideBox.add(innerBox)
  //   return insideBox
  // }


  // private createOutsideBox(): THREE.Object3D {
  //   const outsidePlaneGeo = new THREE.PlaneGeometry(1, 1, 1, 1)
  //   const planeOptionArr = [
  //     {// Right
  //       rotateY: Math.PI / 2,
  //       rotateX: 0,
  //       translate: [0.5, 0, 0]
  //     },
  //     {// Left
  //       rotateY: -Math.PI / 2,
  //       rotateX: 0,
  //       translate: [-0.5, 0, 0]
  //     },
  //     {// Top
  //       rotateY: 0,
  //       rotateX: -Math.PI / 2,
  //       translate: [0, 0.5, 0]
  //     },
  //     {// Bottom
  //       rotateY: 0,
  //       rotateX: Math.PI / 2,
  //       translate: [0, -0.5, 0]
  //     },
  //     {// Back
  //       rotateY: 0,
  //       rotateX: Math.PI,
  //       translate: [0, 0, -0.5]
  //     },
  //   ]
  //   const outsideMat = new THREE.MeshBasicMaterial({
  //     colorWrite: false,
  //   })
  //   const outsideBox = new THREE.Object3D()
  //   planeOptionArr.forEach((opt) => {
  //     const { rotateY, rotateX, translate } = opt
  //     const geo = outsidePlaneGeo.clone().rotateY(rotateY).rotateX(rotateX).translate(translate[0], translate[1], translate[3]);
  //     const mesh = new THREE.Mesh(geo, outsideMat)
  //     outsideBox.add(mesh)
  //   })
  //   return outsideBox
  // }



  public Start() {
    this.renderer.xr.enabled = true;

    // const geometry = new THREE.BoxGeometry(.3, .3, .3);
    // const material = new THREE.MeshStandardMaterial({ color: 0xffffff * Math.random() });
    const planeGeo = new THREE.PlaneGeometry( 50, 50 );
    const self = this;

    // const insideBox = this.createInsideBox()
    // insideBox.scale.setScalar(300 * 0.99)

    // const outsideBox = this.createOutsideBox()
    // outsideBox.scale.setScalar(100)


    // this.scene.add(insideBox)
    // this.scene.add(outsideBox)


    // bouncing icosphere
    const portalPlane = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), 0.0 );
    const geometry = new THREE.IcosahedronGeometry( 5, 0 );
    const material = new THREE.MeshPhongMaterial( {
      color: 0xffffff, emissive: 0x333333, flatShading: true,
      clippingPlanes: [ portalPlane ], clipShadows: true } );
   const smallSphereOne = new THREE.Mesh( geometry, material );
    this.scene.add( smallSphereOne );
  const  smallSphereTwo = new THREE.Mesh( geometry, material );
    this.scene.add( smallSphereTwo );

    // portals
    const portalCamera = new THREE.PerspectiveCamera( 45, 1.0, 0.1, 500.0 );
    this.scene.add( portalCamera );
    //frustumHelper = new THREE.CameraHelper( portalCamera );
    //this.scene.add( frustumHelper );
    // const bottomLeftCorner = new THREE.Vector3();
    // const bottomRightCorner = new THREE.Vector3();
    // const topLeftCorner = new THREE.Vector3();
    // const reflectedPosition = new THREE.Vector3();

    const leftPortalTexture = new THREE.WebGLRenderTarget( 256, 256 );
    const leftPortal = new THREE.Mesh( planeGeo, new THREE.MeshBasicMaterial( { map: leftPortalTexture.texture } ) );
    leftPortal.position.x = - 30;
    leftPortal.position.y = 20;
    leftPortal.scale.set( 0.35, 0.35, 0.35 );
    this.scene.add( leftPortal );

    const  rightPortalTexture = new THREE.WebGLRenderTarget( 256, 256 );
    const  rightPortal = new THREE.Mesh( planeGeo, new THREE.MeshBasicMaterial( { map: rightPortalTexture.texture } ) );
    rightPortal.position.x = 30;
    rightPortal.position.y = 20;
    rightPortal.scale.set( 0.35, 0.35, 0.35 );
    this.scene.add( rightPortal );

    // walls
    const planeTop = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
    planeTop.position.y = 100;
    planeTop.rotateX( Math.PI / 2 );
    this.scene.add( planeTop );

    const planeBottom = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
    planeBottom.rotateX( - Math.PI / 2 );
    this.scene.add( planeBottom );

    const planeFront = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0x7f7fff } ) );
    planeFront.position.z = 50;
    planeFront.position.y = 50;
    planeFront.rotateY( Math.PI );
    this.scene.add( planeFront );

    const planeBack = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0xff7fff } ) );
    planeBack.position.z = - 50;
    planeBack.position.y = 50;
    //planeBack.rotateY( Math.PI );
    this.scene.add( planeBack );

    const planeRight = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0x00ff00 } ) );
    planeRight.position.x = 50;
    planeRight.position.y = 50;
    planeRight.rotateY( - Math.PI / 2 );
    this.scene.add( planeRight );

    const planeLeft = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0xff0000 } ) );
    planeLeft.position.x = - 50;
    planeLeft.position.y = 50;
    planeLeft.rotateY( Math.PI / 2 );
    this.scene.add( planeLeft );

    // lights
    const mainLight = new THREE.PointLight( 0xe7e7e7, 2.5, 250, 0 );
    mainLight.position.y = 60;
    this.scene.add( mainLight );

    const greenLight = new THREE.PointLight( 0x00ff00, 0.5, 1000, 0 );
    greenLight.position.set( 550, 50, 0 );
    this.scene.add( greenLight );

    const redLight = new THREE.PointLight( 0xff0000, 0.5, 1000, 0 );
    redLight.position.set( - 550, 50, 0 );
    this.scene.add( redLight );

    const blueLight = new THREE.PointLight( 0xbbbbfe, 0.5, 1000, 0 );
    blueLight.position.set( 0, 50, 550 );
    this.scene.add( blueLight );




    function onSelect() {
      if (self.reticle.visible) {
        // const cube = new THREE.Mesh(geometry, material);
        // cube.position.setFromMatrixPosition(self.reticle.matrix);
        // cube.name = "cube"
        // self.scene.add(cube)
        // const outsideBox = self.createOutsideBox()
        // outsideBox.scale.setScalar(100)
        // self.scene.add(outsideBox)

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
