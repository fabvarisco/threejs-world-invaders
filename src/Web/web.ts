import * as THREE from "three";

import { Asset } from "@/type";
import SpawnMonsterTower from "@/Assets/SceneObjects/SpawnMonsterTower.ts";
import {
  instanceNewSceneObject,
  PREFABS,
  SCENE_OBJECTS,
} from "@/utils/utils.ts";
import PortalWeb from "@/Assets/SceneObjects/PortalWeb.ts";
import Tower from "@/Assets/SceneObjects/Tower.ts";

class Web {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.Camera;
  private readonly assets: Asset[];

  private start: boolean;
  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    this.start = false;
    this.assets = [
      {
        asset: "SpawnMonsterTower",
        position: new THREE.Vector3(80, -1, 96),
        sceneObjectType: SpawnMonsterTower,
      },
      {
        asset: "SpawnMonsterTower",
        position: new THREE.Vector3(-90, -1, 71),
        sceneObjectType: SpawnMonsterTower,
      },
      {
        asset: "SpawnMonsterTower",
        position: new THREE.Vector3(10, -1, 82),
        sceneObjectType: SpawnMonsterTower,
      },
      {
        asset: "SpawnMonsterTower",
        position: new THREE.Vector3(-20, -1, 90),
        sceneObjectType: SpawnMonsterTower,
      },
      {
        asset: "SpawnMonsterTower",
        position: new THREE.Vector3(40, -1, 82),
        sceneObjectType: SpawnMonsterTower,
      },
      {
        asset: "SpawnMonsterTower",
        position: new THREE.Vector3(90, -1, 73),
        sceneObjectType: SpawnMonsterTower,
      },
      {
        asset: "SpawnMonsterTower",
        position: new THREE.Vector3(-32, -1, 62),
        sceneObjectType: SpawnMonsterTower,
      },
      {
        asset: "PortalWeb",
        position: new THREE.Vector3(0, -1, -90),
        sceneObjectType: PortalWeb,
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
    plane.position.y = -1;

    this.scene.add(plane);

    const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    grid.position.y = -1;

    this.scene.add(grid);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    document.addEventListener("mousedown", (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);

      const intersects = raycaster.intersectObjects([plane]);
      if (intersects.length > 0) {
        // const cubeGeometry = new THREE.BoxGeometry();
        // const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        //
        // cube.position.copy(intersects[0].point);
        //
        // this.scene.add(cube);
        instanceNewSceneObject("Tower", intersects[0].point, Tower, this.scene);
      }
    });

    this._createPrefabs();
  }

  _createPrefabs() {
    for (const { asset, position, sceneObjectType } of this.assets) {
      const prefabObj = PREFABS[asset].GetObject();
      SCENE_OBJECTS.push(
        new sceneObjectType({
          object: prefabObj,
          position: position,
          scene: this.scene,
        }),
      );
    }

    this.start = true;
  }

  Render() {
    if (this.start) {
      for (const obj of SCENE_OBJECTS) {
        obj.Render();
      }
    }
  }
}

export default Web;
