import * as THREE from 'three';
import Portal from "../Assets/portal.ts";

class Web {
    private readonly scene: THREE.Scene;

    constructor(scene:THREE.Scene) {
        this.scene = scene;
        const portal = new Portal(this.scene);
        console.log(portal)

    }

}

export default Web;
