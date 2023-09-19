import * as THREE from 'three';

class Web {
    private scene: THREE.Scene;

    constructor(scene:THREE.Scene) {
        this.scene = scene;

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial();
        const cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );
    }

}

export default Web;
