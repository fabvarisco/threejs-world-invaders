import Prefab from "./Prefab";

class EarthPrefab extends Prefab {
  constructor() {
    super()
  }

  async Load(){
    try {
      const fbx = await this.fbxLoader.loadAsync("earth.fbx");
      this.model = fbx.clone();
      console.log("Earth loaded!")
    } catch (error) {
      console.error(error);
    }
  }

}

export default EarthPrefab;
