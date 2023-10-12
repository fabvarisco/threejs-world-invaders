import { ISceneObjects } from "@/type";
import SceneObject from "./SceneObject";
import { Matrix4 } from "three";

class DraggableObject extends SceneObject {
    private dragging: boolean;
    private matrixWorld: Matrix4;
  constructor({ object, scene, args }: ISceneObjects) {
    super({ object, scene, args });
    this.dragging = false;
    this.matrixWorld = new Matrix4();

    this.object.position.set(
        this.args.position!.x,
        this.args.position!.y,
        this.args.position!.z,
      );
  

  }

  SetMatrix(matrixWorld:any){
    this.matrixWorld = matrixWorld;
  }


  Render() {
    if(this.dragging){
        console.log(this.dragging)
        this.object.position.setFromMatrixPosition(this.matrixWorld);
    }
  }

}

export default DraggableObject;
