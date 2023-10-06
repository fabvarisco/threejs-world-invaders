import Prefab from "@/Assets/Prefab.ts";
import { Scene, Vector3 } from "three";
import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { ISceneObjectsArgs } from "@/type";
export const PREFABS: { [k: string]: Prefab } = {};
export const SCENE_OBJECTS: SceneObject[] = [];

export function instanceNewSceneObject(
  prefabName: string,
  sceneObjectType: typeof SceneObject,
  scene: Scene,
  args: ISceneObjectsArgs,
) {
  const obj = new sceneObjectType({
    object: PREFABS[prefabName].GetObject(),
    scene,
    args,
  });
  SCENE_OBJECTS.push(obj);
  console.log("asaa", SCENE_OBJECTS);
}
export function removeSceneObject(object: SceneObject, scene: Scene) {
  const objIndex = SCENE_OBJECTS.findIndex(
    (obj) => obj.GetUID() === object.GetUID(),
  );
  scene.remove(SCENE_OBJECTS[objIndex].GetObject());
  SCENE_OBJECTS.splice(objIndex, 1);
  console.log(SCENE_OBJECTS);
}

export const DEVICE_POSITION: Vector3 = new Vector3(0, 0, 0);
