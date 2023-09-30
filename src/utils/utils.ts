import Prefab from "@/Assets/Prefab.ts";
import { Scene, Vector3 } from "three";
import SceneObject from "@/Assets/SceneObject.ts";
export const PREFABS: { [k: string]: Prefab } = {};
export const SCENE_OBJECTS: SceneObject[] = [];
export function instanceNewSceneObject(
  prefabName: string,
  position: Vector3,
  sceneObjectType: typeof SceneObject,
  scene: Scene,
) {
  const obj = new sceneObjectType({
    object: PREFABS[prefabName].GetObject(),
    position: position,
    scene: scene,
  });
  SCENE_OBJECTS.push(obj);
}
