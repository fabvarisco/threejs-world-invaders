import { Box3, Group, Scene, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

class Prefab {
  protected loader: GLTFLoader = new GLTFLoader().setPath("./models/");
  protected object: Group = new Group();
  protected scene: Scene;
  protected direction: Vector3;
  protected collisionBox: Box3 = new Box3();
  constructor(scene:Scene) {
    this.direction = new Vector3(0, 0, 0);
    this.scene = scene;
    // this.args = { ...args };
    this._load()
  }

  protected async _load(){
    throw new Error("_load method not implemented!")
  }

 protected Render():void {}


 protected GetObject(): Group {
    return this.object;
  }

  protected GetObjectBox():Box3 {
    return this.collisionBox;
  }

  protected Destroy():void {
  }


  private _setCollisionBox():void {
    this.collisionBox = new Box3().setFromObject(this.object);
    this.collisionBox.getSize(new Vector3());
  }


}

export default Prefab;
