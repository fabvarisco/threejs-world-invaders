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
                object.position.x = this.position.x;
                object.position.y = this.position.y;
                object.position.z = this.position.z;
                return object;
            }).catch(() => {
            throw new Error('Failed to load ' + this.fileName )
        }).finally(()=> console.log("aaaa"));
    }

    AddToScene(scene: THREE.Scene) {
        if (!this.object) return;
        scene.add(this.object);
    }

    _createAChildPrefab() {

    }

    _render(){

    }
}

export default Prefab;