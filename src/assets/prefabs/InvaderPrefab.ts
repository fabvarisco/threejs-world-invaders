import Prefab from "./Prefab";

class InvaderPrefab extends Prefab {
  constructor() {
    super()
  }

  async Load(){
    try {
      const gltf = await this.gltfLoader.loadAsync("invader.glb");
      this.model = gltf.scene.clone();
      console.log("invader.glb loaded!");
    } catch (error) {
      console.error(error);
    }
  }

}

export default InvaderPrefab;
