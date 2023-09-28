import * as THREE from 'three';
import Prefab from "./Prefab.ts";

class Tower extends Prefab {
    constructor(fileName: string, position: THREE.Vector3) {
        super(fileName, position)
        console.log("tower")

        const spanwTimer = setInterval(() => {
            console.log("teste")
        },5000)
    }

    _render(){
        super._render();
        //console.log("render tower")

    }



}

export default Tower;