import Prefab from "@/Assets/Prefab.ts";
import { Group, Scene, Vector3 } from "three";
import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import PlayerShoot from "@/Assets/SceneObjects/PlayerShoot.ts";
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
  console.log(SCENE_OBJECTS);
}

export function instanceNewPlayerShoot(
  prefabName: string,
  position: Vector3,
  scene: Scene,
  velocity: Vector3,
  controller: Group,
) {
  const obj = new PlayerShoot(
    {
      object: PREFABS[prefabName].GetObject(),
      position: position,
      scene: scene,
    },
    velocity,
    controller,
  );
  SCENE_OBJECTS.push(obj);
  console.log(SCENE_OBJECTS);
}

export function removeSceneObject(object: SceneObject, scene: Scene) {
  for (let i = SCENE_OBJECTS.length; i--; ) {
    if (SCENE_OBJECTS[i].GetUID() === object.GetUID()) {
      scene.remove(SCENE_OBJECTS[i].GetObject());
      SCENE_OBJECTS.splice(i, 1);
    }
  }
}

export const DEVICE_POSITION: Vector3 = new Vector3(0, 0, 0);
