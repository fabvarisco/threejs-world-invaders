import * as THREE from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'

class ResourceManager {
    private fbxLoader: FBXLoader;
    private textureLoader: THREE.TextureLoader;
    private fbxCache: Record<string, THREE.Object3D> = {};
    private textureCache: Record<string, THREE.Texture> = {};

    constructor() {
        this.fbxLoader = new FBXLoader();
        this.textureLoader = new THREE.TextureLoader();
    }

    async loadFBXModel(modelPath: string): Promise<THREE.Object3D> {
        return new Promise((resolve, reject) => {
            if (this.fbxCache[modelPath]) {
                resolve(this.fbxCache[modelPath].clone());
            } else {
                this.fbxLoader.load(modelPath, (object3D) => {
                    object3D.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            if (child.material.map) {
                                const texturePath = "path/para/sua/texture.jpg";
                                this.loadTexture(texturePath).then((texture) => {
                                    child.material.map = texture;
                                });
                            }
                        }
                    });

                    this.fbxCache[modelPath] = object3D;
                    resolve(object3D.clone());
                }, undefined, reject);
            }
        });
    }
    async loadTexture(texturePath: string): Promise<THREE.Texture> {
        return new Promise((resolve, reject) => {
            if (this.textureCache[texturePath]) {
                resolve(this.textureCache[texturePath].clone());
            } else {
                this.textureLoader.load(texturePath, (texture) => {
                    this.textureCache[texturePath] = texture;
                    resolve(texture.clone());
                }, undefined, reject);
            }
        });
    }
}

export default ResourceManager;