import * as THREE from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'

class Prefab {
    private loader: FBXLoader;
    private readonly fileName: string;
    private position: THREE.Vector3;
    private object: THREE.Group | null;

    constructor(fileName: string, position: THREE.Vector3) {
        this.position = position;
        this.fileName = fileName;
        this.object = null;
        this.loader = new FBXLoader();
    }

    async Load() {
       this.object = await this.loader.loadAsync(`src/Assets/models/${this.fileName}.fbx`)
            .then(object => {
                object.scale.set(0.01, 0.01, 0.01);

                return object;
            }).catch(() => {
            throw new Error('Failed to load ' + this.fileName )
        }).finally(()=> console.log("aaaa"));
    }

    AddToScene(scene: THREE.Scene,position:THREE.Vector3) {
        if (!this.object) return;
        this.object.position.x = position.x;
        this.object.position.y = position.y;
        this.object.position.z = position.z;
        scene.add(this.object.clone());
    }

    _createAChildPrefab() {

    }

    _render(){

    }
}

export default Prefab;