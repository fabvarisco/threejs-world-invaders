import { ISceneObjects } from "@/type";
import SceneObject from "./SceneObject";
import { Vector3 } from "three-nebula/src/core/three";

class InvaderObject extends SceneObject {
    constructor({fileName, scene, args }: ISceneObjects) {
        super({fileName, scene, args })
    }

    protected async _load() {
        const self = this;
        this.loader
        .loadAsync(this.fileName)
        .then((gltf) => {
          gltf.scene.scale.set(this.args.scale!,this.args.scale!,this.args.scale!);
          self.object = gltf.scene.clone();
        })
        .catch((err: string) => console.log(err));
    }

    public Update(position:Vector3):void{
        const speed = 0.01;
        const direction = new Vector3();
        direction.subVectors(position, this.object.position);
        direction.normalize();
        this.object.position.addScaledVector(direction, speed);
        this.object.position.add(this.args.velocity!);
        this.collisionBox.setFromObject(this.object);
        this.object.lookAt(position);
        const distance = position.distanceTo(this.object.position);
        if (distance <= 1.0) {
        }
    }


}

export default InvaderObject;
