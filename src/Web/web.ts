import * as THREE from 'three';

import Prefab from "@/Assets/Prefab.ts";
import {Asset} from "@/type";
import Tower from "@/Assets/Tower.ts";

class Web {
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.Camera;
    private readonly assets: Asset[];
    private prefabs: {[k: string]: Prefab};
    constructor(scene: THREE.Scene, camera: THREE.Camera, prefabs: {[k: string]: Prefab}) {
        this.scene = scene;
        this.camera = camera;
        this.prefabs = prefabs;
        this.assets = [{
            asset: "Tower",
            position: new THREE.Vector3(80, 0, 96),
            prefabType: Tower
        }, {
            asset: "Tower",
            position: new THREE.Vector3(-90, 0, 71),
            prefabType: Tower
        }, {
            asset: "Tower",
            position: new THREE.Vector3(10, 0, 82),
            prefabType: Tower
        }
            , {
                asset: "Tower",
                position: new THREE.Vector3(-20, 0, 90),
                prefabType: Tower
            }, {
                asset: "Tower",
                position: new THREE.Vector3(40, 0, 82),
                prefabType: Tower
            }, {
                asset: "Tower",
                position: new THREE.Vector3(90, 0, 73),
                prefabType: Tower
            }, {
                asset: "Tower",
                position: new THREE.Vector3(-32, 0, 62),
                prefabType: Tower
            }
        ];

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshPhongMaterial({
            color: 0xcbcbcb,
            depthWrite: false
        }));
        plane.rotation.x = -Math.PI / 2;
        this.scene.add(plane);

        const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        this.scene.add(grid);

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        document.addEventListener('mousedown', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);

            const intersects = raycaster.intersectObjects([plane]);
            if (intersects.length > 0) {
                const cubeGeometry = new THREE.BoxGeometry();
                const cubeMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
                const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

                cube.position.copy(intersects[0].point);

                this.scene.add(cube);
            }
        });

        this._createPrefabs();

    }
    _createPrefabs() {
        for (const {asset, position} of this.assets) {
            this.prefabs[asset].AddToScene(this.scene, position);
        }
    }

    Render(timestamp:any, frame:any) {
       // this.prefabs.forEach(item => item._render())
    }
}

export default Web;