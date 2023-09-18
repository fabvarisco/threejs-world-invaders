import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {ARButton} from 'three/addons/webxr/ARButton.js';


class App {
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private reticle: THREE.Mesh;
    private hitTestSource: any;
    private hitTestSourceRequested: boolean;
    private localSpace: any;
    constructor() {
        this.hitTestSource = undefined;
        this.hitTestSourceRequested = false;
        this.localSpace = undefined;

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0))

        this.scene = new THREE.Scene();

        this.scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1).normalize();
        this.scene.add(light);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true, alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);


        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 3.5, 0);
        this.controls.update();


        this.reticle = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial());
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);

        window.addEventListener('resize', this.resize.bind(this));
    }

    public Start() {
        this.renderer.xr.enabled = true;

        const startArButton = ARButton.createButton(this.renderer, {requiredFeatures: ['hit-test']})
        document.body.appendChild(startArButton)

        const controller: THREE.Group = this.renderer.xr.getController(0) as THREE.Group;
        controller.addEventListener('select', this.onSelect.bind(this));

        this.scene.add(controller);

        this.renderer.setAnimationLoop(this.render.bind(this));
    }

    private resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }


    private onSelect() {
        if (this.reticle.visible) {

            const geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32);
            const material = new THREE.MeshPhongMaterial({
                color: 0xffffff * Math.random()
            });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.setFromMatrixPosition(this.reticle.matrix);
            mesh.quaternion.setFromRotationMatrix(this.reticle.matrix);

            this.scene.add(mesh);
        }
    }


    private async initHitTest() {
        const self = this;
        const session = this.renderer.xr.getSession();
        const viewerSpace = await session?.requestReferenceSpace("viewer");
        this.localSpace = await session?.requestReferenceSpace("local");
        //@ts-ignore
        this.hitTestSource = await session?.requestHitTestSource({space: viewerSpace});
        this.hitTestSourceRequested = true;
        session?.addEventListener("end", () => {
            self.hitTestSourceRequested = false;
            self.hitTestSource = null;
        })
    }

    //@ts-ignore
    private render(timestamp: any, frame: any) {
        if (frame) {
            if (!this.hitTestSourceRequested) {
                this.initHitTest();
            }
            // 2. get hit test results
            if (this.hitTestSourceRequested) {
                const hitTestResults = frame.getHitTestResults(this.hitTestSource);

                if (hitTestResults.length > 0) {
                    const hit = hitTestResults[0];
                    const pose = hit.getPose(this.localSpace);

                    this.reticle.visible = true;
                    this.reticle.matrix.fromArray(pose.transform.matrix);
                } else {
                    this.reticle.visible = false;
                }
            }

            this.renderer.render(this.scene, this.camera);
        }
    }
}

export default App;
