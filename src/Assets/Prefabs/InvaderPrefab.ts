import Prefab from "./Prefab";

class InvaderPrefab extends Prefab {
  constructor() {
    super()
  }

  async Load(){
    const self = this;
    this.gltfLoader
        .loadAsync("invader.glb")
        .then((gltf) => {
          self.object = gltf.scene.clone();
        })
        .catch((err: string) => console.log(err))
        .finally(()=> console.log("invader.glb loaded!" ));
  }

}

export default InvaderPrefab;
