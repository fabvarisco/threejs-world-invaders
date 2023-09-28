import * as THREE from 'three';
import Prefab from "./Prefab.ts";

class Tower extends Prefab {
    constructor(fileName: string, position: THREE.Vector3) {
        super(fileName, position)
    }
}

export default Tower;