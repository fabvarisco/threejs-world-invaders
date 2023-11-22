import { Box3, Group, Scene, Sphere, Vector3 } from "three";
import { ISceneObjects, ISceneObjectsArgs } from "@/type";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

class SceneObject {
  protected fileName: string = "";
  protected loader: GLTFLoader = new GLTFLoader().setPath("./models/");
  protected object: Group = new Group();
  protected scene: Scene;
  protected direction: Vector3;
  protected collisionBox: Box3 = new Box3();
  protected args: ISceneObjectsArgs;
  constructor({ fileName, scene, args }: ISceneObjects) {
    this.direction = new Vector3(0, 0, 0);
    this.scene = scene;
    this.fileName = fileName;
    this.args = { ...args };
    this._load()
  }

  protected async _load(){
    throw new Error("_load method not implemented!")
  }

  private _setCollisionBox():void {
    this.collisionBox = new Box3().setFromObject(this.object);
    this.collisionBox.getSize(new Vector3());
  }

  Render():void {}


  GetObject(): Group {
    return this.object;
  }

  GetObjectBox():Box3 {
    return this.collisionBox;
  }

  Destroy():void {
  }

}

export default SceneObject;
