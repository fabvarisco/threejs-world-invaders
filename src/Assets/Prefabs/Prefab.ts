import { Box3, Group, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";


class Prefab {
  protected gltfLoader: GLTFLoader = new GLTFLoader().setPath("./models/");
  protected fbxLoader: FBXLoader = new FBXLoader().setPath("./models/");
  protected model: Group | undefined;
  protected direction: Vector3 = new Vector3(0, 0, 0);
  protected collisionBox: Box3 = new Box3();
  protected velocity: Vector3 = new Vector3();
  constructor() {
  }

  public async Load(){}

 public GetObject(): Group {
    return this.model!;
  }
}

export default Prefab;
