import Prefab from "./Prefab";

class EarthPrefab extends Prefab {
  constructor() {
    super()
  }

  async Load(){
    super.Load();
    const self = this;
    this.fbxLoader
    .loadAsync("Earth.fbx")
    .then((fbx) => {
      self.object = fbx.clone();
    })
    .catch((err: string) => console.log(err));
  }

}

export default EarthPrefab;
