import * as THREE from 'three';

class AR {
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private meshes: THREE.Mesh[];
    private geometry: THREE.BufferGeometry;
    private controller: THREE.Group;

    constructor(scene:THREE.Scene, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.renderer = renderer;

        this.geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06);
        this.meshes = [];

        this.controller = this.renderer.xr.getController(0) as THREE.Group;
        this.controller.addEventListener('select', this._onSelect.bind(this));
        this.scene.add(this.controller);

    }


    private _onSelect() {
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
        const mesh = new THREE.Mesh(this.geometry, material);
        mesh.position.set(0, 0, -0.3).applyMatrix4(this.controller.matrixWorld);
        mesh.quaternion.setFromRotationMatrix(this.controller.matrixWorld);
        this.scene.add(mesh);
        this.meshes.push(mesh);
    }

}

export default AR;