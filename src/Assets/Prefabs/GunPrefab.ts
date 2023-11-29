import Prefab from "./Prefab";

class GunPrefab extends Prefab {
  constructor() {
    super()
  }

  async Load(){
    try {
      const gltf = await this.gltfLoader.loadAsync("gun.glb");
      this.model = gltf.scene.clone();
      console.log("gun.glb loaded!");
    } catch (error) {
      console.error(error);
    }
  }

}

export default GunPrefab;
