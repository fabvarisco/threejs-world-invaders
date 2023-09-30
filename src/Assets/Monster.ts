import * as THREE from 'three';
import Prefab from "./Prefab.ts";

class Monster extends Prefab {
    constructor(fileName: string, position: THREE.Vector3) {
        super(fileName, position)
        console.log("monster")


    }

    _render() {
        super._render();
        //console.log("render tower")

    }


}

export default Monster;