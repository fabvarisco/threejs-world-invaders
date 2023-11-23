import { Box3, Group, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";


class Prefab {
  protected gltfLoader: GLTFLoader = new GLTFLoader().setPath("./models/");
  protected fbxLoader: FBXLoader = new FBXLoader().setPath("./models/");
  protected object: Group | undefined;
  protected direction: Vector3 = new Vector3(0, 0, 0);
  protected collisionBox: Box3 = new Box3();
  constructor() {
  }

  public async Load(){}

 protected Render():void {}


 public GetObject(): Group {
    return this.object!;
  }

  protected GetObjectBox():Box3 {
    return this.collisionBox;
  }

  protected Destroy():void {
  }


  // private _setCollisionBox():void {
  //   this.collisionBox = new Box3().setFromObject(this.object);
  //   this.collisionBox.getSize(new Vector3());
  // }


}

export default Prefab;
