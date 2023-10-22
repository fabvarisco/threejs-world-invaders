import Prefab from "@/Assets/Prefab.ts";
import { Group, Scene, Vector3 } from "three";
import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";
import { ISceneObjectsArgs } from "@/type";
import Web from "@/Web/web.ts";
import AR from "@/AR/ar.ts";
import TitleScreen from "@/TitleScreen/TitleScreen.ts";
export const PREFABS: { [k: string]: Prefab } = {};
export const SCENE_OBJECTS: SceneObject[] = [];
export const PARENT_GROUP: Group = new Group();
export function instanceNewSceneObject(
  prefabName: string,
  sceneObjectType: typeof SceneObject,
  scene: Scene,
  args: ISceneObjectsArgs,
): void {
  const obj = new sceneObjectType({
    object: PREFABS[prefabName].GetObject(),
    scene,
    args,
  });
  SCENE_OBJECTS.push(obj);
}
export function removeSceneObject(object: SceneObject, scene: Scene): void {
  const objIndex = SCENE_OBJECTS.findIndex(
    (obj) => obj.GetUID() === object.GetUID(),
  );
  scene.remove(SCENE_OBJECTS[objIndex].GetObject());
  SCENE_OBJECTS.splice(objIndex, 1);
}

export function getRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export const DEVICE_POSITION: Vector3 = new Vector3(0, 0, 0);
export enum STATES {
  CHASING,
  HIT,
  ATTACKING,
  DIE,
}

export let ACTIVE_GAME: Web | AR | TitleScreen | undefined = undefined;
