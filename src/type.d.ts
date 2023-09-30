import * as THREE from "three";
import Prefab from "@/Assets/Prefab.ts";
import { Group, Scene, Vector3 } from "three";
import SceneObject from "@/Assets/SceneObject.ts";

interface ISceneObjects {
  object: Group;
  position?: Vector3;
  scene: Scene;
}

type Asset = {
  asset: string;
  position: THREE.Vector3;
  sceneObjectType: typeof SceneObject;
};
