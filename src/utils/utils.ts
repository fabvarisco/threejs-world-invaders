import Prefab from "@/Assets/Prefab.ts";
import { Scene, Vector3 } from "three";
import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import TowerShoot from "@/Assets/SceneObjects/TowerShoot.ts";
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

export function instanceNewTowerShoot(
  prefabName: string,
  position: Vector3,
  scene: Scene,
  target: SceneObject,
) {
  const obj = new TowerShoot({
    object: PREFABS[prefabName].GetObject(),
    position: position,
    scene: scene,
  });
  obj.SetTarget(target);
  SCENE_OBJECTS.push(obj);
}

export function removeSceneObject(object: SceneObject) {
  for (let i = SCENE_OBJECTS.length; i--; ) {
    if (SCENE_OBJECTS[i].GetUID() === object.GetUID()) {
      SCENE_OBJECTS.splice(i, 1);
    }
  }
}
