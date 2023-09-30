import * as THREE from "three";
import Prefab from "./Prefab.ts";
import { instanceNewPrefab } from "@/utils/utils.ts";
class Tower extends Prefab {
  private spawnTimer: number;
  constructor(fileName: string, scene: THREE.Scene) {
    super(fileName, scene);
    this.spawnTimer = 5000;
  }

  Init() {
    // const spanwTimer = setInterval(() => {
    //   instanceNewPrefab("Monster", this.object?.position);
    // }, 5000);
  }

  _render() {
    super._render();
    this.spawnTimer -= 1;
    if (this.spawnTimer <= 0) {
      instanceNewPrefab("Monster", this.object?.position);
      this.spawnTimer = 5000;
      console.log("spawn");
    }
  }
}

export default Tower;
