import * as THREE from "three";

import { Asset } from "@/type";
import Tower from "@/Assets/Tower.ts";
import { PREFABS } from "@/utils/utils.ts";
import Monster from "@/Assets/Monster.ts";
import SceneObject from "@/Assets/SceneObject.ts";

class Web {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.Camera;
  private readonly assets: Asset[];
  private readonly sceneObjects: SceneObject[];

  private start: boolean;
  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    this.start = false;
    this.sceneObjects = [];
    this.assets = [
      {
        asset: "Tower",
        position: new THREE.Vector3(80, 0, 96),
        prefabType: Tower,
      },
      {
        asset: "Tower",
        position: new THREE.Vector3(-90, 0, 71),
        prefabType: Tower,
      },
      {
        asset: "Tower",
        position: new THREE.Vector3(10, 0, 82),
        prefabType: Tower,
      },
      {
        asset: "Tower",
        position: new THREE.Vector3(-20, 0, 90),
        prefabType: Tower,
      },
      {
        asset: "Tower",
        position: new THREE.Vector3(40, 0, 82),
        prefabType: Tower,
      },
      {
        asset: "Tower",
        position: new THREE.Vector3(90, 0, 73),
        prefabType: Tower,
      },
      {
        asset: "Tower",
        position: new THREE.Vector3(-32, 0, 62),
        prefabType: Tower,
      },
      {
        asset: "Monster",
        position: new THREE.Vector3(0, 0, 0),
        prefabType: Monster,
      },
    ];

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshPhongMaterial({
        color: 0xcbcbcb,
        depthWrite: false,
      }),
    );
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    this.scene.add(grid);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    document.addEventListener("mousedown", (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);

      const intersects = raycaster.intersectObjects([plane]);
      if (intersects.length > 0) {
        const cubeGeometry = new THREE.BoxGeometry();
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

        cube.position.copy(intersects[0].point);

        this.scene.add(cube);
      }
    });

    this._createPrefabs();
  }

  _createPrefabs() {
    for (const { asset, position } of this.assets) {
      const prefabObj = PREFABS[asset].GetObject();
      this.sceneObjects.push(new SceneObject(prefabObj, position, this.scene));
    }

    this.start = true;
  }

  Render(timestamp: any, frame: any) {
    console.log("render web");
    if (this.start) {
      for (const obj of this.sceneObjects) {
        obj.Render();
      }
    }
  }
}

export default Web;
