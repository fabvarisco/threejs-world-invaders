import * as THREE from "three";
import Prefab from "@/Assets/Prefab.ts";
import { Group, Scene, Vector3 } from "three";
import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";

interface ISceneObjectsArgs {
  position?: Vector3;
  scale?:number;
  velocity?: Vector3;
  controller?: Group;
  target?: any;
  intersections?: any;
}
interface ISceneObjects {
  fileName: string;
  scene: Scene;
  args: ISceneObjectsArgs;
}

type Asset = {
  sceneObjectType: typeof SceneObject;
};
